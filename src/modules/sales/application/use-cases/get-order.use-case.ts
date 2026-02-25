// src/modules/sales/application/use-cases/get-order.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

]
@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, merchantId: string) {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Security: Ensure order belongs to merchant
    if (order.merchantId !== merchantId) {
      throw new OrderNotFoundException(orderId);
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber.value,
      status: order.status,
      channel: order.channel,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice.value,
        quantity: item.quantity.value,
        subtotal: item.subtotal.value,
      })),
      subtotal: order.subtotal.value,
      deliveryFee: order.deliveryFee.value,
      total: order.total.value,
      fulfillmentInfo: order.fulfillmentInfo?.toJSON(),
      paymentId: order.paymentId,
      notes: order.notes,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
