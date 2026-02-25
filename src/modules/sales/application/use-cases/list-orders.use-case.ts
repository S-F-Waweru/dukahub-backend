// src/modules/sales/application/use-cases/list-orders.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderStatus } from '../../domain/enums/sales-module.enums';

export interface ListOrdersDto {
  merchantId: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  // todo paginate or add search params
  async execute(dto: ListOrdersDto) {
    const orders = await this.orderRepo.findByMerchant(dto.merchantId, {
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      limit: dto.limit || 50,
      offset: dto.offset || 0,
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber.value,
      status: order.status,
      channel: order.channel,
      customerId: order.customerId,
      itemCount: order.items.length,
      total: order.total.value,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    }));
  }
}
