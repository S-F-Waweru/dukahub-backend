// src/modules/sales/application/use-cases/mark-order-as-shipped.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

import { OrderShippedEvent } from '../../domain/events/order-shipped.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

@Injectable()
export class MarkOrderAsShippedUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(orderId: string, merchantId: string): Promise<void> {
    // 1. Get order
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Security check
    if (order.merchantId !== merchantId) {
      throw new OrderNotFoundException(orderId);
    }

    // 2. Mark as shipped
    try {
      order.markAsShipped();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // 3. Persist
    await this.orderRepo.update(order);

    // 4. Emit event (notify customer)
    this.eventEmitter.emit(
      'order.shipped',
      new OrderShippedEvent(
        order.id,
        order.orderNumber.value,
        order.customerId!,
        order.fulfillmentInfo?.toJSON(),
      ),
    );
  }
}
