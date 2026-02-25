// src/modules/sales/application/use-cases/mark-order-as-delivered.use-case.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

@Injectable()
export class MarkOrderAsDeliveredUseCase {
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
      order.markAsDelivered();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    await this.orderRepo.update(order);
  }
}
