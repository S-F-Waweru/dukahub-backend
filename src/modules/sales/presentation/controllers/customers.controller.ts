import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.use-case';
import { GetCustomerOrdersUseCase } from '../../application/use-cases/get-customer-orders.use-case';
import { CreateCustomerDto } from '../dtos/customers.dto';
import { JwtAuthGuard } from '../../../merchant-auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../merchant-auth/presentation/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly getCustomerOrdersUseCase: GetCustomerOrdersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create customer',
    description: 'Register a new customer',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
  })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.createCustomerUseCase.execute({
      ...dto,
      merchantId,
    });

    return {
      success: true,
      message: 'Customer created successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
  })
  async getCustomer(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const customer = await this.getCustomerUseCase.execute(id, merchantId);

    return {
      success: true,
      data: customer,
    };
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get customer orders' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Customer orders retrieved successfully',
  })
  async getCustomerOrders(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const orders = await this.getCustomerOrdersUseCase.execute(id, merchantId);

    return {
      success: true,
      data: orders,
      total: orders.length,
    };
  }
}
