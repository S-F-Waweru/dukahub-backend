import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type {
  InitiatePaymentDto,
} from '../../application/use-cases/initiate-payment.use-case';
import { InitiatePaymentUseCase } from '../../application/use-cases/initiate-payment.use-case'
import { PaymentMethod } from '../../domain/enums/payament.enum';
import { GetPaymentStatusUseCase } from '../../application/use-cases/get-payment-status.use-case';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { ReconcilePaymentUseCase } from '../../application/use-cases/reconcile-payment.use-case';
import { HandleCallbackUseCase } from '../../application/use-cases/handle-callback.use-case';
import { TransactionFiltersDto } from '../dto/transaction-filters.dto';
import { MpesaCallbackDto } from '../dto/mpese-callback.dto';
import { ProcessCashUseCase } from '../../application/use-cases/process-cash.use-case';
import { ProcessCashDto } from '../dto/process-cash-dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private initiatePaymentUseCase: InitiatePaymentUseCase,
    private processCashUseCase: ProcessCashUseCase,
    private getPaymentStatusUseCase: GetPaymentStatusUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private getTransactionUseCase: GetTransactionUseCase,
    private reconcilePaymentUseCase: ReconcilePaymentUseCase,
    private handleCallbackUseCase: HandleCallbackUseCase,
  ) {}

  logger = new Logger(PaymentController.name);
  /** Storefront + POS: initiate async payment (M-Pesa, Airtel, Card) */
  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.initiatePaymentUseCase.execute(dto);
  }

  /** POS only: process cash — STAFF or OWNER */
  @Post('cash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'STAFF')
  @HttpCode(HttpStatus.OK)
  async cash(@Body() dto: ProcessCashDto, @CurrentUser() user: any) {
    return this.processCashUseCase.execute({
      ...dto,
      merchantId: user.merchantId,
    });
  }

  /** Storefront: customer polls payment result during checkout */
  @Get('status/:orderId')
  async status(@Param('orderId') orderId: string) {
    return this.getPaymentStatusUseCase.execute(orderId);
  }

  /** OWNER only: paginated transaction list */
  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async list(
    @CurrentUser() user: any,
    @Query() filters: TransactionFiltersDto,
  ) {
    return this.getTransactionsUseCase.execute(user.merchantId, {
      ...filters,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    });
  }

  /** OWNER only: single transaction detail */
  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  async detail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.getTransactionUseCase.execute(id, user.merchantId);
  }

  /** OWNER only: manual reconcile trigger */
  @Post('reconcile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @HttpCode(HttpStatus.OK)
  async reconcile(@CurrentUser() user: any) {
    return this.reconcilePaymentUseCase.execute(user.merchantId);
  }

  /** Public — Daraja callback (secured by IP whitelist in Nginx) */
  // @Post('callback/mpesa')
  // @HttpCode(HttpStatus.OK)
  // async mpesaCallback(@Body() payload: Record<string, unknown>) {
  //   await this.handleCallbackUseCase.execute({
  //     method: PaymentMethod.MPESA_STK,
  //     rawPayload: payload,
  //   });
  //   return { ResultCode: 0, ResultDesc: 'Accepted' }; // Daraja expects this exact shape
  // }

  @Post('callback/mpesa')
  @HttpCode(HttpStatus.OK)
  async mpesaCallback(@Body() payload: MpesaCallbackDto) {
    try {
      await this.handleCallbackUseCase.execute({
        method: PaymentMethod.MPESA_STK,
        rawPayload: payload as unknown as Record<string, unknown>,
      });
    } catch (error) {
      this.logger.error('M-Pesa callback error', error);
      // Still return 200 — never let Daraja think your endpoint is broken
    }
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  /** Public — Airtel callback (Phase 2, uncomment when adapter is built) */
  // @Post('callback/airtel')
  // async airtelCallback(@Body() payload: Record<string, unknown>) {
  //   await this.handleCallbackUseCase.execute({ method: PaymentMethod.AIRTEL_MONEY, rawPayload: payload });
  // }
}
