import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Schemas
import { OrderSchema } from './infrastructure/persistence/schemas/order.schema';
import { OrderItemSchema } from './infrastructure/persistence/schemas/order-item.schema';
import { CustomerSchema } from './infrastructure/persistence/schemas/customer.schema';

// Repositories

import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { IOrderRepository } from './domain/repositories/order.repository.interface';
import { ICustomerRepository } from './domain/repositories/customer.repository.interface';

// Use Cases - Order Management
import { CreatePOSOrderUseCase } from './application/use-cases/create-pos-order.use-case';
import { CreateOnlineOrderUseCase } from './application/use-cases/create-online-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case';

// Use Cases - Customer Management
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { GetCustomerOrdersUseCase } from './application/use-cases/get-customer-orders.use-case';

// Event Handlers
import { OrderPaidHandler } from './application/handlers/order-paid.handler';
import { OrderCancelledHandler } from './application/handlers/order-cancelled.handler';
import { MarkOrderAsPaidUseCase } from './application/use-cases/mark-order-as-paid.usecase';
import { MarkOrderAsShippedUseCase } from './application/use-cases/mark-order-as-shipped.usecase';
import { MarkOrderAsDeliveredUseCase } from './application/use-cases/mark-as-delivered.use-case';
import { CompleteOrderUseCase } from './application/use-cases/complete-order-use-case';
import { OrderRepository } from './infrastructure/repositories/order.repositories';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersController } from './presentation/controllers/orders.controllers';
import { CustomersController } from './presentation/controllers/customers.controller';
import { StockInUseCase } from '../inventory/application/use-cases/stock-in.usecase';

const useCases = [
  // Order Management
  CreatePOSOrderUseCase,
  CreateOnlineOrderUseCase,
  GetOrderUseCase,
  ListOrdersUseCase,
  CancelOrderUseCase,

  // Order Lifecycle
  MarkOrderAsPaidUseCase,
  MarkOrderAsShippedUseCase,
  MarkOrderAsDeliveredUseCase,
  CompleteOrderUseCase,

  // Customer Management
  CreateCustomerUseCase,
  GetCustomerUseCase,
  GetCustomerOrdersUseCase,

  StockInUseCase,
];

const repositories = [
  {
    provide: IOrderRepository,
    useClass: OrderRepository,
  },
  {
    provide: ICustomerRepository,
    useClass: CustomerRepository,
  },

  // {
  //   provide : IStockMovementRepository,
  //   useClass: StockMovementRepository,
  // },
];

const eventHandlers = [OrderPaidHandler, OrderCancelledHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderSchema, OrderItemSchema, CustomerSchema]),
    EventEmitterModule.forRoot(),
    InventoryModule, // Import for stock integration
  ],
  controllers: [OrdersController, CustomersController],
  providers: [...useCases, ...repositories, ...eventHandlers],
  exports: [
    // Export use cases for other modules if needed
    CreatePOSOrderUseCase,
    CreateOnlineOrderUseCase,
    GetOrderUseCase,
  ],
})
export class SalesModule {}
