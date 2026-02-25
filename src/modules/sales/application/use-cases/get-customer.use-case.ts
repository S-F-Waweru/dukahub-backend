// src/modules/sales/application/use-cases/get-customer.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CustomerNotFoundException } from '../../domain/exceptions/sales-module.exceptions';


@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(customerId: string, merchantId: string) {
    const customer = await this.customerRepo.findById(customerId);

    if (!customer) {
      throw new CustomerNotFoundException(customerId);
    }

    // Security check
    if (customer.merchantId !== merchantId) {
      throw new CustomerNotFoundException(customerId);
    }

    return {
      id: customer.id,
      phoneNumber: customer.phoneNumber.value,
      email: customer.email?.value,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.getFullName(),
      totalSpent: customer.totalSpent.value,
      orderCount: customer.orderCount,
      lifetimeValue: customer.getLifetimeValue(),
      isReturningCustomer: customer.isReturningCustomer(),
      daysSinceLastOrder: customer.getDaysSinceLastOrder(),
      firstOrderAt: customer.firstOrderAt,
      lastOrderAt: customer.lastOrderAt,
      createdAt: customer.createdAt,
    };
  }
}
