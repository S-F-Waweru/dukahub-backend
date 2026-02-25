// src/modules/sales/application/use-cases/mark-order-as-paid.use-case.ts
import { Injectable, Inject } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderPaidEvent } from '../../domain/events/order-paid.event';
import {
  InvalidOrderStatusException,
  OrderNotFoundException,
} from '../../domain/exceptions/sales-module.exceptions';

export interface MarkOrderAsPaidDto {
  orderId: string;
  paymentId: string;
  merchantId: string;
}

@Injectable()
export class MarkOrderAsPaidUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: MarkOrderAsPaidDto): Promise<void> {
    // 1. Get order
    const order = await this.orderRepo.findById(dto.orderId);

    if (!order) {
      throw new OrderNotFoundException(dto.orderId);
    }

    // Security check
    if (order.merchantId !== dto.merchantId) {
      throw new OrderNotFoundException(dto.orderId);
    }

    // 2. Mark as paid (domain validates status transition)
    try {
      order.markAsPaid(dto.paymentId);
    } catch (error) {
      throw new InvalidOrderStatusException(order.status, 'mark as paid');
    }

    // 3. Update customer stats if customer exists
    if (order.customerId) {
      const customer = await this.customerRepo.findById(order.customerId);
      if (customer) {
        customer.recordOrder(order.total);
        await this.customerRepo.update(customer);
      }
    }

    // 4. Persist order
    await this.orderRepo.update(order);

    // 5. Emit event (triggers stock deduction)
    this.eventEmitter.emit(
      'order.paid',
      new OrderPaidEvent(
        order.id,
        order.orderNumber.value,
        order.merchantId,
        dto.paymentId,
        order.total.value,
      ),
    );

    // 6. Auto-complete POS orders
    if (order.channel === 'POS') {
      order.markAsCompleted();
      await this.orderRepo.update(order);
    }
  }
}
