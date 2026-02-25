// src/modules/sales/domain/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'PENDING', // Order created, awaiting payment
  PAID = 'PAID', // Payment received
  SHIPPED = 'SHIPPED', // Order dispatched (online only)
  DELIVERED = 'DELIVERED', // Order received by customer (online only)
  COMPLETED = 'COMPLETED', // Order fully completed
  CANCELLED = 'CANCELLED', // Order cancelled
}

// src/modules/sales/domain/enums/order-channel.enum.ts
export enum OrderChannel {
  POS = 'POS', // In-store purchase
  ONLINE = 'ONLINE', // E-commerce website
}
