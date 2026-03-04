import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderSchema } from '../persistence/schemas/order.schema';
import { OrderItemSchema } from '../persistence/schemas/order-item.schema';
import {
  OrderChannel,
  OrderStatus,
} from '../../domain/enums/sales-module.enums';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderSchema)
    private readonly orderRepo: Repository<OrderSchema>,
    @InjectRepository(OrderItemSchema)
    private readonly orderItemRepo: Repository<OrderItemSchema>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const schema = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByOrderNumber(
    orderNumber: string,
    merchantId: string,
  ): Promise<Order | null> {
    const schema = await this.orderRepo.findOne({
      where: { orderNumber, merchantId },
      relations: ['items'],
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByMerchant(
    merchantId: string,
    options?: {
      status?: OrderStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<Order[]> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.merchantId = :merchantId', { merchantId });

    if (options?.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: options.status,
      });
    }

    if (options?.startDate && options?.endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .take(options?.limit || 50)
      .skip(options?.offset || 0);

    const schemas = await queryBuilder.getMany();
    return schemas.map((schema) => this.toDomain(schema));
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const schemas = await this.orderRepo.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(order: Order): Promise<Order> {
    const schema = this.toSchema(order);
    const saved = await this.orderRepo.save(schema);

    // Reload with relations
    const reloaded = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: ['items'],
    });

    return this.toDomain(reloaded!);
  }

  async update(order: Order): Promise<Order> {
    const schema = this.toSchema(order);
    await this.orderRepo.save(schema);
    return order;
  }

  async delete(id: string): Promise<void> {
    await this.orderRepo.softDelete(id);
  }

  async getTotalRevenue(
    merchantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.merchantId = :merchantId', { merchantId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
      })
      .andWhere('order.paidAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return parseFloat(result.total || 0);
  }

  async getOrderCountByStatus(
    merchantId: string,
    status: OrderStatus,
  ): Promise<number> {
    return await this.orderRepo.count({
      where: { merchantId, status },
    });
  }

  // Mappers
  private toDomain(schema: OrderSchema): Order {
    const items = schema.items.map((itemSchema) =>
      OrderItem.fromPersistence({
        id: itemSchema.id,
        orderId: itemSchema.orderId,
        variantId: itemSchema.variantId,
        productName: itemSchema.productName,
        sku: itemSchema.sku,
        unitPrice: itemSchema.unitPrice,
        quantity: itemSchema.quantity,
        subtotal: itemSchema.subtotal,
        taxAmount: itemSchema.taxAmount,
      }),
    );

    return Order.fromPersistence({
      id: schema.id,
      orderNumber: schema.orderNumber,
      merchantId: schema.merchantId,
      customerId: schema.customerId,
      items,
      subtotal: schema.subtotal,
      deliveryFee: schema.deliveryFee,
      total: schema.total,
      status: schema.status as OrderStatus,
      channel: schema.channel as OrderChannel,
      fulfillmentInfo: schema.fulfillmentInfo,
      paymentId: schema.paymentId,
      notes: schema.notes,
      paidAt: schema.paidAt,
      shippedAt: schema.shippedAt,
      deliveredAt: schema.deliveredAt,
      cancelledAt: schema.cancelledAt,
      cancellationReason: schema.cancellationReason,
    });
  }

  private toSchema(order: Order): OrderSchema {
    const schema = new OrderSchema();
    schema.id = order.id;
    schema.orderNumber = order.orderNumber.value;
    schema.merchantId = order.merchantId;
    schema.customerId = order.customerId;
    schema.subtotal = order.subtotal.value;
    schema.deliveryFee = order.deliveryFee.value;
    schema.total = order.total.value;
    schema.status = order.status;
    schema.channel = order.channel;
    schema.fulfillmentInfo = order.fulfillmentInfo?.toJSON();
    schema.paymentId = order.paymentId;
    schema.notes = order.notes;
    schema.paidAt = order.paidAt;
    schema.shippedAt = order.shippedAt;
    schema.deliveredAt = order.deliveredAt;

    // Map items
    schema.items = order.items.map((item) => {
      const itemSchema = new OrderItemSchema();
      itemSchema.id = item.id;
      itemSchema.orderId = order.id;
      itemSchema.variantId = item.variantId;
      itemSchema.productName = item.productName;
      itemSchema.sku = item.sku;
      itemSchema.unitPrice = item.unitPrice.value;
      itemSchema.quantity = item.quantity.value;
      itemSchema.subtotal = item.subtotal.value;
      itemSchema.taxAmount = item.taxAmount?.value;
      return itemSchema;
    });

    return schema;
  }
}
