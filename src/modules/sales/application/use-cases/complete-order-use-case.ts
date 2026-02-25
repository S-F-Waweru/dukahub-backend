// src/modules/sales/application/use-cases/complete-order.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderCompletedEvent } from '../../domain/events/order-completed.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

@Injectable()
export class CompleteOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(orderId: string, merchantId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    if (order.merchantId !== merchantId) {
      throw new OrderNotFoundException(orderId);
    }

    try {
      order.markAsCompleted();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    await this.orderRepo.update(order);

    this.eventEmitter.emit(
      'order.completed',
      new OrderCompletedEvent(
        order.id,
        order.merchantId,
        order.customerId,
        order.total.value,
      ),
    );
  }
}
