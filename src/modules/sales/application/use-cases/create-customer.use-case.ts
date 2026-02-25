// src/modules/sales/application/use-cases/create-customer.use-case.ts
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';

export interface CreateCustomerDto {
  merchantId: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<{
    customerId: string;
  }> {
    // 1. Check if customer already exists
    const existing = await this.customerRepo.findByPhone(
      dto.phoneNumber,
      dto.merchantId,
    );

    if (existing) {
      throw new ConflictException(
        'Customer with this phone number already exists',
      );
    }

    // 2. Check email uniqueness if provided
    if (dto.email) {
      const existingEmail = await this.customerRepo.findByEmail(
        dto.email,
        dto.merchantId,
      );
      if (existingEmail) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // 3. Create customer entity
    const customer = Customer.create({
      merchantId: dto.merchantId,
      phoneNumber: dto.phoneNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
    });

    // 4. Persist
    const savedCustomer = await this.customerRepo.save(customer);

    return {
      customerId: savedCustomer.id,
    };
  }
}
