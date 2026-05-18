import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './presentation/controllers/stock-controller';
import { CreateProductUseCase } from './application/use-cases/create-product-use-case.service';
import { UpdateProductUseCase } from './application/use-cases/update-product.usecase';
import { DeleteProductUseCase } from './application/use-cases/delete-product.usecase';
import { GetProductUseCase } from './application/use-cases/get-product.usecase';
import { StockOutUseCase } from './application/use-cases/stock-out.usecase';
import { AdjustStockUseCase } from './application/use-cases/adjust-stock.usecase';
import { GetStockMovementsUseCase } from './application/use-cases/get-stock-movements.usercase';
import { GetLowStockProductUseCase } from './application/use-cases/get-low-stock-product.usecase';
import { ListProductUseCase } from './application/use-cases/list-product.usecase';

import InventoryController from './presentation/controllers/inventory-controller';
import { StockInUseCase } from './application/use-cases/stock-in.usecase';
import { CreateCategoryUseCase } from './application/use-cases/create-category.usecase';
import { ListCategoriesUseCase } from './application/use-cases/list-category.usecase';
import { GetCategoryUseCase } from './application/use-cases/get-category.usecase';
import { IProductRepository } from './domain/interfaces/product-repository.interface';
import { ProductRepository } from './infrastructure/persistence/reposotories/product.repository';
import { IProductVariantRepository } from './domain/interfaces/product-variant.repository.interface';
import { ProductVariantRepository } from './infrastructure/persistence/reposotories/product-variant.repository';
import { IStockMovementRepository } from './domain/interfaces/stock-movement.repository.interface';
import { StockMovementRepository } from './infrastructure/persistence/reposotories/stock-movement.repository';
import { ICategoryRepository } from './domain/interfaces/category-repository.interface';
import { CategoryRepository } from './infrastructure/persistence/reposotories/category.repository';
import { CategorySchema } from './infrastructure/persistence/schema/category.schema';
import { CategoryController } from './presentation/controllers/category.controller';
import { ProductSchema } from './infrastructure/persistence/schema/product.schema';
import { ProductVariantSchema } from './infrastructure/persistence/schema/product-variant.schema';
import { StockMovementSchema } from './infrastructure/persistence/schema/stock-movement.schema';


const useCases = [
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  GetProductUseCase,
  ListProductUseCase,
  StockInUseCase,
  StockOutUseCase,
  AdjustStockUseCase,
  GetStockMovementsUseCase,
  GetLowStockProductUseCase,
  CreateCategoryUseCase,
  ListCategoriesUseCase,
  GetCategoryUseCase,
];

const repositories = [
  {
    provide: IProductRepository,
    useClass: ProductRepository,
  },
  {
    provide: IProductVariantRepository,
    useClass: ProductVariantRepository,
  },
  {
    provide: IStockMovementRepository,
    useClass: StockMovementRepository,
  },
  {
      provide: ICategoryRepository,
      useClass: CategoryRepository,
  },
];

// const eventHandlers = [StockOutMonitorListener];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductSchema,
      ProductVariantSchema,
      StockMovementSchema,
      CategorySchema,
    ]),
    // CqrsModule, // For event bus
  ],
  controllers: [InventoryController, StockController, CategoryController],
  providers: [
    ...useCases,
    ...repositories,
    // ...eventHandlers
  ],
  exports: [
    // Export use cases for other modules (e.g., E-commerce)
    StockOutUseCase,
    GetProductUseCase,
    IProductVariantRepository,
    IStockMovementRepository,
  ],
})
export class InventoryModule {}
