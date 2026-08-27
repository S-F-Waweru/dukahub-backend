// src/modules/sales/application/use-cases/create-pos-order.use-case.ts
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderChannel } from '../../domain/enums/sales-module.enums';
import { IProductVariantRepository } from '../../../inventory/domain/interfaces/product-variant.repository.interface';

export interface CreatePOSOrderDto {
  merchantId: string;
  customerId?: string; // Optional for walk-in
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  notes?: string;
}

@Injectable()
export class CreatePOSOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(IProductVariantRepository)
    private readonly variantRepo: IProductVariantRepository,
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreatePOSOrderDto): Promise<{
    orderId: string;
    orderNumber: string;
    total: number;
  }> {
    // 1. Validate items exist and have sufficient stock
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const variant = await this.variantRepo.findById(
        item.variantId,
        dto.merchantId,
      );

      if (!variant) {
        throw new BadRequestException(
          `Product variant ${item.variantId} not found`,
        );
      }

      // Check stock availability
      if (variant.currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant.sku.value}. Available: ${variant.currentStock}`,
        );
      }

      // Create order item (snapshot product details)
      const orderItem = OrderItem.create({
        orderId: '', // Will be set after order creation
        variantId: variant.id,
        productName: variant.productId, // You'd typically fetch product name
        sku: variant.sku.value,
        unitPrice: variant.sellingPrice.value,
        quantity: item.quantity,
      });

      orderItems.push(orderItem);
    }

    // 2. Validate customer if provided
    if (dto.customerId) {
      const customer = await this.customerRepo.findById(dto.customerId);
      if (!customer) {
        throw new BadRequestException('Customer not found');
      }
    }

    // 3. Generate order number
    const orderNumber = OrderNumber.generate();

    // 4. Create order entity
    const order = Order.create({
      orderNumber,
      merchantId: dto.merchantId,
      customerId: dto.customerId,
      items: orderItems,
      channel: OrderChannel.POS,
      notes: dto.notes,
    });

    // 5. Persist order
    const savedOrder = await this.orderRepo.save(order);

    //todo chaeck the order for the parameters
    // 6. Emit domain event
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(
        savedOrder.id,
        savedOrder.orderNumber.value,
        savedOrder.merchantId,
        savedOrder.total.value,
        // savedOrder.customerId,
        'POS',
      ),
    );

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber.value,
      total: savedOrder.total.value,
    };
  }
}
