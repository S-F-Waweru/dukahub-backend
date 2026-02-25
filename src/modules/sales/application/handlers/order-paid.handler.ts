import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaidEvent } from '../../domain/events/order-paid.event';

import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { StockOutUseCase } from '../../../inventory/application/use-cases/stock-out.usecase';

@Injectable()
export class OrderPaidHandler {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly stockOutUseCase: StockOutUseCase,
  ) {}

  @OnEvent('order.paid')
  async handle(event: OrderPaidEvent) {
    // Get order details
    const order = await this.orderRepo.findById(event.orderId);

    if (!order) return;

    // Deduct stock for each item
    for (const item of order.items) {
      await this.stockOutUseCase.execute(
        {
          variantId: item.variantId,
          quantity: item.quantity.value,
          referenceType: 'ORDER',
          referenceId: order.id,
          notes: `Stock deducted for order ${order.orderNumber.value}`,
        },
        'SYSTEM', // userId
        order.merchantId,
      );
    }
  }
}
