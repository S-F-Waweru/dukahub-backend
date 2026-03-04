import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';

import { CreatePOSOrderUseCase } from '../../application/use-cases/create-pos-order.use-case';
import { CreateOnlineOrderUseCase } from '../../application/use-cases/create-online-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/list-orders.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { MarkOrderAsPaidUseCase } from '../../application/use-cases/mark-order-as-paid.usecase';
import { MarkOrderAsShippedUseCase } from '../../application/use-cases/mark-order-as-shipped.usecase';
import { MarkOrderAsDeliveredUseCase } from '../../application/use-cases/mark-as-delivered.use-case';
import { CompleteOrderUseCase } from '../../application/use-cases/complete-order-use-case';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import {
  CancelOrderDto,
  CreateOnlineOrderDto,
  CreatePOSOrderDto,
  ListOrdersQueryDto,
  MarkAsPaidDto,
} from '../dtos/orders.dto';
import { OrderStatus } from '../../domain/enums/sales-module.enums';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createPOSOrderUseCase: CreatePOSOrderUseCase,
    private readonly createOnlineOrderUseCase: CreateOnlineOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly markAsPaidUseCase: MarkOrderAsPaidUseCase,
    private readonly markAsShippedUseCase: MarkOrderAsShippedUseCase,
    private readonly markAsDeliveredUseCase: MarkOrderAsDeliveredUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
  ) {}

  @Post('pos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create POS order',
    description: 'Create an in-store point-of-sale order',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        success: true,
        data: {
          orderId: 'uuid',
          orderNumber: 'DKH-20260223-12345',
          total: 2500.0,
        },
      },
    },
  })
  async createPOSOrder(
    @Body() dto: CreatePOSOrderDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.createPOSOrderUseCase.execute({
      ...dto,
      merchantId,
    });

    return {
      success: true,
      message: 'POS order created successfully',
      data: result,
    };
  }

  @Post('online')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create online order',
    description: 'Create an e-commerce order with delivery information',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  async createOnlineOrder(
    @Body() dto: CreateOnlineOrderDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.createOnlineOrderUseCase.execute({
      ...dto,
      merchantId,
    });

    return {
      success: true,
      message: 'Online order created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List orders',
    description: 'Get all orders for merchant with optional filters',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  async listOrders(
    @Query() query: ListOrdersQueryDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const orders = await this.listOrdersUseCase.execute({
      merchantId,
      status: query.status as OrderStatus,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    });

    return {
      success: true,
      data: orders,
      total: orders.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const order = await this.getOrderUseCase.execute(id, merchantId);

    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.cancelOrderUseCase.execute({
      orderId: id,
      merchantId,
      reason: dto.reason,
    });

    return {
      success: true,
      message: 'Order cancelled successfully',
    };
  }

  @Put(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as paid' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() dto: MarkAsPaidDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.markAsPaidUseCase.execute({
      orderId: id,
      paymentId: dto.paymentId,
      merchantId,
    });

    return {
      success: true,
      message: 'Order marked as paid',
    };
  }

  @Put(':id/mark-shipped')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as shipped' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async markAsShipped(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.markAsShippedUseCase.execute(id, merchantId);

    return {
      success: true,
      message: 'Order marked as shipped',
    };
  }

  @Put(':id/mark-delivered')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as delivered' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async markAsDelivered(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.markAsDeliveredUseCase.execute(id, merchantId);

    return {
      success: true,
      message: 'Order marked as delivered',
    };
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async completeOrder(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.completeOrderUseCase.execute(id, merchantId);

    return {
      success: true,
      message: 'Order completed',
    };
  }
}
