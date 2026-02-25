import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/sales-module.enums';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(
    orderNumber: string,
    merchantId: string,
  ): Promise<Order | null>;
  findByMerchant(
    merchantId: string,
    options?: {
      status?: OrderStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<Order[]>;
  findByCustomer(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
  getTotalRevenue(
    merchantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;
  getOrderCountByStatus(
    merchantId: string,
    status: OrderStatus,
  ): Promise<number>;
}

export const IOrderRepository = Symbol('IOrderRepository');
