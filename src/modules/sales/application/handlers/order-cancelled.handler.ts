import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { StockInUseCase } from '../../../inventory/application/use-cases/stock-in.usecae';

@Injectable()
export class OrderCancelledHandler {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly stockInUseCase: StockInUseCase,
  ) {}

  @OnEvent('order.cancelled')
  async handle(event: OrderCancelledEvent) {
    // Get order details
    const order = await this.orderRepo.findById(event.orderId);

    if (!order) return;

    // Restore stock for each item (only if order was already paid)
    if (order.paidAt) {
      for (const item of order.items) {
        await this.stockInUseCase.execute(
          {
            variantId: item.variantId,
            quantity: item.quantity.value,
            notes: `Stock restored from cancelled order ${order.orderNumber.value}`,
          },
          'SYSTEM',
          order.merchantId,
        );
      }
    }
  }
}
