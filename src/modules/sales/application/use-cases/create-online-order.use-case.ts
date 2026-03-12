// src/modules/sales/application/use-cases/create-online-order.use-case.ts
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';

import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IProductVariantRepository } from '../../../inventory/domain/interface/product-variant.repository.interface';
import { FulfillmentInfo } from '../../domain/entities/fulfillment-info.vo';
import { OrderChannel } from '../../domain/enums/sales-module.enums';

export interface CreateOnlineOrderDto {
  merchantId: string;
  customerId: string; // Required for online
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  fulfillmentInfo: {
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  notes?: string;
}

@Injectable()
export class CreateOnlineOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(IProductVariantRepository)
    private readonly variantRepo: IProductVariantRepository,
    @Inject(ICustomerRepository)
    private readonly customerRepo: ICustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateOnlineOrderDto): Promise<{
    orderId: string;
    orderNumber: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  }> {
    // 1. Validate customer exists
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    // 2. Validate items and check stock
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const variant = await this.variantRepo.findById(item.variantId);

      if (!variant) {
        throw new BadRequestException(
          `Product variant ${item.variantId} not found`,
        );
      }

      if (variant.currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant.sku.value}. Available: ${variant.currentStock}`,
        );
      }

      const orderItem = OrderItem.create({
        orderId: '',
        variantId: variant.id,
        productName: variant.productId,
        sku: variant.sku.value,
        unitPrice: variant.sellingPrice.value,
        quantity: item.quantity,
      });

      orderItems.push(orderItem);
    }

    // 3. Create fulfillment info (validates address)
    const fulfillmentInfo = new FulfillmentInfo(
      {
        phone: dto.fulfillmentInfo.phone,
        addressLine1: dto.fulfillmentInfo.addressLine1,
        addressLine2: dto.fulfillmentInfo.addressLine2,
        city: dto.fulfillmentInfo.city,
        region: dto.fulfillmentInfo.region,
        landmark: dto.fulfillmentInfo.landmark,
      },
      dto.fulfillmentInfo.deliveryInstructions,
    );

    // 4. Generate order number
    const orderNumber = OrderNumber.generate();

    // 5. Create order entity
    const order = Order.create({
      orderNumber,
      merchantId: dto.merchantId,
      customerId: dto.customerId,
      items: orderItems,
      channel: OrderChannel.ONLINE,
      fulfillmentInfo,
      notes: dto.notes,
    });

    // 6. Persist order
    const savedOrder = await this.orderRepo.save(order);

    // 7. Emit domain event
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(
        savedOrder.id,
        savedOrder.orderNumber.value,
        savedOrder.merchantId,
        savedOrder.total.value,
        'ONLINE',
        savedOrder.customerId,
      ),
    );

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber.value,
      subtotal: savedOrder.subtotal.value,
      deliveryFee: savedOrder.deliveryFee.value,
      total: savedOrder.total.value,
    };
  }
}
