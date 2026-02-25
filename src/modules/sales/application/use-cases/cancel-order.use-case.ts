// src/modules/sales/application/use-cases/cancel-order.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

export interface CancelOrderDto {
  orderId: string;
  merchantId: string;
  reason: string;
}

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CancelOrderDto): Promise<void> {
    // 1. Get order
    const order = await this.orderRepo.findById(dto.orderId);

    if (!order) {
      throw new OrderNotFoundException(dto.orderId);
    }

    // Security check
    if (order.merchantId !== dto.merchantId) {
      throw new OrderNotFoundException(dto.orderId);
    }

    // 2. Cancel order (domain logic validates if cancellation is allowed)
    try {
      order.cancel(dto.reason);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // 3. Persist
    await this.orderRepo.update(order);

    // 4. Emit event (will trigger stock restoration)
    this.eventEmitter.emit(
      'order.cancelled',
      new OrderCancelledEvent(order.id, order.merchantId, dto.reason),
    );
  }
}
