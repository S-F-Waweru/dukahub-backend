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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { InitiatePaymentDto } from '../../application/use-cases/initiate-payment.use-case';
import { ProcessCashDto } from '../../application/use-cases/process-cash.use-case';
import { PaymentMethod } from '../../domain/enums/payament.enum';

@Controller('payments')
export class PaymentController {
  constructor(
    private initiatePaymentUseCase: any,
    private processCashUseCase: any,
    private getPaymentStatusUseCase: any,
    private getTransactionsUseCase: any,
    private processTransactionsUseCase: any,
    protected
  ) {}
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
    return this.getTransactionsUseCase.execute(user.merchantId, filters);
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
  @Post('callback/mpesa')
  @HttpCode(HttpStatus.OK)
  async mpesaCallback(@Body() payload: Record<string, unknown>) {
    await this.handleCallbackUseCase.execute({
      method: PaymentMethod.MPESA_STK,
      rawPayload: payload,
    });
    return { ResultCode: 0, ResultDesc: 'Accepted' }; // Daraja expects this exact shape
  }

  /** Public — Airtel callback (Phase 2, uncomment when adapter is built) */
  // @Post('callback/airtel')
  // async airtelCallback(@Body() payload: Record<string, unknown>) {
  //   await this.handleCallbackUseCase.execute({ method: PaymentMethod.AIRTEL_MONEY, rawPayload: payload });
  // }
}
