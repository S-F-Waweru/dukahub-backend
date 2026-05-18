import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GetMerchantUseCase } from '../../application/use-cases/get-merchant.use-case';
import { UpdateMerchantUseCase } from '../../application/use-cases/update-merchant.use-case';
import { UpdatePaymentInfoUseCase } from '../../application/use-cases/update-payment-info.use-case';

import { CurrentUser } from '../../../merchant-auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../merchant-auth/presentation/guards/jwt-auth.guard';
import { CreateMerchantUseCase } from '../../application/use-cases/create-merchant.use-case';
import { MerchantResponseDto } from '../dtos/merchant-response.dto';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { UpdatePaymentInfoDto } from '../dtos/update-payment-info.dto';
import { UpdateMerchantDto } from '../dtos/update-merchant.dto';

@ApiTags('Merchant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly getMerchantUseCase: GetMerchantUseCase,
    private readonly updateMerchantUseCase: UpdateMerchantUseCase,
    private readonly updatePaymentInfoUseCase: UpdatePaymentInfoUseCase,
    private readonly createMerchantUseCase: CreateMerchantUseCase,
  ) {}

  logger = new Logger(MerchantController.name)

  @Post()
  @ApiOperation({
    summary: 'Create merchant',
    description: 'Create a new merchant',
  })
  @ApiResponse({
    status: 201,
    description: 'Merchant created successfully',
    type: MerchantResponseDto,
  })
  async createMerchant(
    @Body() dto: CreateMerchantDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {

    await this.createMerchantUseCase.execute(dto, merchantId);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current merchant',
    description: 'Get details of the currently authenticated merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant retrieved successfully',
    type: MerchantResponseDto,
  })
  async getCurrentMerchant(@CurrentUser('merchantId') merchantId: string) {
    const merchant = await this.getMerchantUseCase.execute(merchantId);
    return {
      success: true,
      data: {
        id: merchant.id,
        businessName: merchant.businessName.value,
        type: merchant.type,
        phoneNumber: merchant.phoneNumber,
        email: merchant.email,
        physicalAddress: merchant.physicalAddress,
        kraPin: merchant.kraPin?.value,
        mpesaTill: merchant.mpesaTill,
        airtelMoneyNumber: merchant.airtelMoneyNumber,
        status: merchant.status,
        subscriptionTier: merchant.subscriptionTier,
        onboardedAt: merchant.onboardedAt,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by ID' })
  @ApiParam({ name: 'id', description: 'Merchant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Merchant retrieved successfully',
    type: MerchantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getMerchant(@Param('id') id: string) {
    const merchant = await this.getMerchantUseCase.execute(id);
    return {
      success: true,
      data: {
        id: merchant.id,
        businessName: merchant.businessName.value,
        type: merchant.type,
        phoneNumber: merchant.phoneNumber,
        email: merchant.email,
        status: merchant.status,
      },
    };
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update merchant business info',
    description: 'Update business name, address, and KRA PIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant updated successfully',
  })
  async updateMerchant(
    @CurrentUser('merchantId') merchantId: string,
    @Body() dto: UpdateMerchantDto,
  ) {
    await this.updateMerchantUseCase.execute(merchantId, dto);
    return {
      success: true,
      message: 'Merchant information updated successfully',
    };
  }

  @Put('me/payment-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update payment information',
    description: 'Update M-Pesa and Airtel Money payment details',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment information updated successfully',
  })
  async updatePaymentInfo(
    @CurrentUser('merchantId') merchantId: string,
    @Body() dto: UpdatePaymentInfoDto,
  ) {
    await this.updatePaymentInfoUseCase.execute(merchantId, dto);
    return {
      success: true,
      message: 'Payment information updated successfully',
    };
  }
}
