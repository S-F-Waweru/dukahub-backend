import { Customer } from '../entities/customer.entity';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByPhone(
    phoneNumber: string,
    merchantId: string,
  ): Promise<Customer | null>;
  findByEmail(email: string, merchantId: string): Promise<Customer | null>;
  findByMerchant(merchantId: string): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
  getTopCustomers(merchantId: string, limit: number): Promise<Customer[]>;
}

export const ICustomerRepository = Symbol('ICustomerRepository');