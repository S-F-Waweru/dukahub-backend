// src/modules/sales/application/use-cases/get-customer-orders.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CustomerNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

@Injectable()
export class GetCustomerOrdersUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(customerId: string, merchantId: string) {
    // 1. Validate customer exists and belongs to merchant
    const customer = await this.customerRepo.findById(customerId);

    if (!customer || customer.merchantId !== merchantId) {
      throw new CustomerNotFoundException(customerId);
    }

    // 2. Get customer orders
    const orders = await this.orderRepo.findByCustomer(customerId);

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber.value,
      status: order.status,
      channel: order.channel,
      total: order.total.value,
      itemCount: order.items.length,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    }));
  }
}
