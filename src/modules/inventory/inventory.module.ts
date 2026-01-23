import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {StockController} from "./presentation/controllers/stock-controller";
import {ProductSchema} from "./infarastructure/perisistence/schema/product.schema";
import { ProductVariantSchema } from "./infarastructure/perisistence/schema/product-variant.schema";
import { StockMovementSchema } from "./infarastructure/perisistence/schema/stock-movement.schema";
import { CreateProductUseCase } from "./application/use-cases/create-product-use-case.service";
import {UpdateProductUseCase} from "./application/use-cases/update-product.usecase";
import {DeleteProductUseCase} from "./application/use-cases/delete-product.usecase";
import {GetProductUseCase} from "./application/use-cases/get-product.usecase";
import {StockInUseCase} from "./application/use-cases/stock-in.usecae";
import {StockOutUseCase} from "./application/use-cases/stock-out.usecase";
import {AdjustStockUseCase} from "./application/use-cases/adjust-stock.usecase";
import {GetStockMovementsUseCase} from "./application/use-cases/get-stock-movements.usercase";
import {GetLowStockProductUseCase} from "./application/use-cases/get-low-stock-product.usecase";
import {ListProductUseCase} from "./application/use-cases/list-product.usecase";
import {IProductRepository} from "./domain/interface/product-repository.interface";
import {ProductRepository} from "./infarastructure/perisistence/reposotories/product.repository";
import {IProductVariantRepository} from "./domain/interface/product-variant.repository.interface";
import {ProductVariantRepository} from "./infarastructure/perisistence/reposotories/product-variant.repository";
import {IStockMovementRepository} from "./domain/interface/stock-movement.repsotory.interface";
import {StockMovementRepository} from "./infarastructure/perisistence/reposotories/stock-movement.repository";
import InventoryController from "./presentation/controllers/inventory-controller";


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
    // {
    //     provide: ICategoryRepository,
    //     useClass: CategoryRepository,
    // },
];

// const eventHandlers = [StockOutMonitorListener];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductSchema,
            ProductVariantSchema,
            StockMovementSchema,
            // CategorySchema,
        ]),
        // CqrsModule, // For event bus
    ],
    controllers: [InventoryController, StockController],
    providers: [...useCases,
        ...repositories,
        // ...eventHandlers
    ],
    exports: [
        // Export use cases for other modules (e.g., E-commerce)
        StockOutUseCase,
        GetProductUseCase,
        IProductVariantRepository,
    ],
})
export class InventoryModule {}