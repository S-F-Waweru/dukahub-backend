import { BaseEntity } from '../../../../shared/domain/base.entity';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exeption';
import { OrderNumber } from '../value-objects/order-number.vo';
import { Money } from '../value-objects/money.vo';
import { OrderItem } from './order-item.entity';
import { OrderChannel, OrderStatus } from '../enums/sales-module.enums';
import { FulfillmentInfo } from './fulfillment-info.vo';

export class Order extends BaseEntity {
  private readonly _orderNumber: OrderNumber;
  private readonly _merchantId: string;
  private readonly _customerId?: string; // Optional for walk-in customers
  private _items: OrderItem[] = [];
  private _subtotal: Money;
  private _deliveryFee: Money;
  private _total: Money;
  private _status: OrderStatus;
  private readonly _channel: OrderChannel;
  private readonly _fulfillmentInfo?: FulfillmentInfo; // Required for delivery orders
  private _paymentId?: string; // Link to payment transaction
  private readonly _notes?: string;
  private _paidAt?: Date;
  private _shippedAt?: Date;
  private _deliveredAt?: Date;
  private _cancelledAt?: Date;
  private _cancellationReason?: string;

  private constructor(props: {
    id?: string;
    orderNumber: OrderNumber;
    merchantId: string;
    customerId?: string;
    items: OrderItem[];
    channel: OrderChannel;
    fulfillmentInfo?: FulfillmentInfo;
    notes?: string;
    status?: OrderStatus;
  }) {
    super(props.id);
    this._orderNumber = props.orderNumber;
    this._merchantId = props.merchantId;
    this._customerId = props.customerId;
    this._items = props.items;
    this._channel = props.channel;
    this._fulfillmentInfo = props.fulfillmentInfo;
    this._notes = props.notes;
    this._status = props.status || OrderStatus.PENDING;
  }

  // Validation
  private validate(): void {
    if (!this._merchantId) {
      throw new DomainException('Merchant ID is required');
    }

    if (this._items.length === 0) {
      throw new DomainException('Order must have at least one item');
    }

    // Online orders MUST have customer and fulfillment info
    if (this._channel === OrderChannel.ONLINE) {
      if (!this._customerId) {
        throw new DomainException('Customer ID is required for online orders');
      }
      if (!this._fulfillmentInfo) {
        throw new DomainException(
          'Fulfillment info is required for online orders',
        );
      }
    }
  }

  // Business Logic - Order Lifecycle
  public markAsPaid(paymentId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new DomainException('Can only mark pending orders as paid');
    }
    this._status = OrderStatus.PAID;
    this._paymentId = paymentId;
    this._paidAt = new Date();
    this.touch();
  }

  public markAsShipped(): void {
    if (this._status !== OrderStatus.PAID) {
      throw new DomainException('Can only ship paid orders');
    }
    if (this._channel === OrderChannel.POS) {
      throw new DomainException('POS orders do not require shipping');
    }
    this._status = OrderStatus.SHIPPED;
    this._shippedAt = new Date();
    this.touch();
  }

  public markAsDelivered(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new DomainException('Can only deliver shipped orders');
    }
    this._status = OrderStatus.DELIVERED;
    this._deliveredAt = new Date();
    this.touch();
  }

  public markAsCompleted(): void {
    // POS orders go directly from PAID to COMPLETED
    if (
      this._channel === OrderChannel.POS &&
      this._status === OrderStatus.PAID
    ) {
      this._status = OrderStatus.COMPLETED;
      this.touch();
      return;
    }

    // Online orders must be delivered first
    if (
      this._channel === OrderChannel.ONLINE &&
      this._status !== OrderStatus.DELIVERED
    ) {
      throw new DomainException(
        'Online orders must be delivered before completion',
      );
    }

    this._status = OrderStatus.COMPLETED;
    this.touch();
  }

  public cancel(reason: string): void {
    if (
      this._status === OrderStatus.COMPLETED ||
      this._status === OrderStatus.DELIVERED
    ) {
      throw new DomainException('Cannot cancel completed or delivered orders');
    }
    this._status = OrderStatus.CANCELLED;
    this._cancelledAt = new Date();
    this._cancellationReason = reason;
    this.touch();
  }

  // Business Logic - Items
  public addItem(item: OrderItem): void {
    this._items.push(item);
    this._subtotal = this.calculateSubtotal();
    this._total = this._subtotal.add(this._deliveryFee);
    this.touch();
  }

  public removeItem(itemId: string): void {
    this._items = this._items.filter((item) => item.id !== itemId);
    this._subtotal = this.calculateSubtotal();
    this._total = this._subtotal.add(this._deliveryFee);
    this.touch();
  }

  public canBeCancelled(): boolean {
    return ![
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ].includes(this._status);
  }

  public requiresShipping(): boolean {
    return this._channel === OrderChannel.ONLINE;
  }

  // Business Logic - Calculate Totals
  private calculateSubtotal(): Money {
    const total = this._items.reduce(
      (sum, item) => sum + item.subtotal.value,
      0,
    );
    return new Money(total);
  }

  private calculateDeliveryFee(): Money {
    // POS orders have no delivery fee
    if (this._channel === OrderChannel.POS) {
      return Money.zero();
    }

    // Online orders calculate based on fulfillment info
    if (this._fulfillmentInfo) {
      return this._fulfillmentInfo.calculateDeliveryFee();
    }

    return Money.zero();
  }

  // Getters
  get orderNumber(): OrderNumber {
    return this._orderNumber;
  }
  get merchantId(): string {
    return this._merchantId;
  }
  get customerId(): string | undefined {
    return this._customerId;
  }
  get items(): OrderItem[] {
    return [...this._items];
  }
  get subtotal(): Money {
    return this._subtotal;
  }
  get deliveryFee(): Money {
    return this._deliveryFee;
  }
  get total(): Money {
    return this._total;
  }
  get status(): OrderStatus {
    return this._status;
  }
  get channel(): OrderChannel {
    return this._channel;
  }
  get fulfillmentInfo(): FulfillmentInfo | undefined {
    return this._fulfillmentInfo;
  }
  get paymentId(): string | undefined {
    return this._paymentId;
  }
  get notes(): string | undefined {
    return this._notes;
  }
  get paidAt(): Date | undefined {
    return this._paidAt;
  }
  get shippedAt(): Date | undefined {
    return this._shippedAt;
  }
  get deliveredAt(): Date | undefined {
    return this._deliveredAt;
  }
}
