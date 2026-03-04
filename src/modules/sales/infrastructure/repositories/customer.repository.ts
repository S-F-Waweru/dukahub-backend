import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerSchema } from '../persistence/schemas/customer.schema';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerSchema)
    private readonly repo: Repository<CustomerSchema>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const schema = await this.repo.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByPhone(
    phoneNumber: string,
    merchantId: string,
  ): Promise<Customer | null> {
    // Normalize phone number for search
    const normalized = phoneNumber.replace(/\s+/g, '');
    const schema = await this.repo.findOne({
      where: { phoneNumber: normalized, merchantId },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByEmail(
    email: string,
    merchantId: string,
  ): Promise<Customer | null> {
    const schema = await this.repo.findOne({
      where: { email: email.toLowerCase(), merchantId },
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByMerchant(merchantId: string): Promise<Customer[]> {
    const schemas = await this.repo.find({
      where: { merchantId },
      order: { lastOrderAt: 'DESC' },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(customer: Customer): Promise<Customer> {
    const schema = this.toSchema(customer);
    const saved = await this.repo.save(schema);
    return this.toDomain(saved);
  }

  async update(customer: Customer): Promise<Customer> {
    const schema = this.toSchema(customer);
    await this.repo.save(schema);
    return customer;
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async getTopCustomers(
    merchantId: string,
    limit: number,
  ): Promise<Customer[]> {
    const schemas = await this.repo.find({
      where: { merchantId },
      order: { totalSpent: 'DESC' },
      take: limit,
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  // Mappers
  private toDomain(schema: CustomerSchema): Customer {
    return Customer.fromPersistence({
      id: schema.id,
      merchantId: schema.merchantId,
      phoneNumber: schema.phoneNumber,
      firstName: schema.firstName,
      lastName: schema.lastName,
      email: schema.email,
      totalSpent: schema.totalSpent,
      orderCount: schema.orderCount,
      firstOrderAt: schema.firstOrderAt,
      lastOrderAt: schema.lastOrderAt,
    });
  }

  private toSchema(customer: Customer): CustomerSchema {
    const schema = new CustomerSchema();
    schema.id = customer.id;
    schema.merchantId = customer.merchantId;
    schema.phoneNumber = customer.phoneNumber.value;
    schema.email = customer.email?.value;
    schema.firstName = customer.firstName;
    schema.lastName = customer.lastName;
    schema.totalSpent = customer.totalSpent.value;
    schema.orderCount = customer.orderCount;
    schema.firstOrderAt = customer.firstOrderAt;
    schema.lastOrderAt = customer.lastOrderAt;
    return schema;
  }
}
