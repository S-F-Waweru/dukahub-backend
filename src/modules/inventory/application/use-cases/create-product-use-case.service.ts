import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { IProductVariantRepository } from '../../domain/interface/product-variant.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/interface/product-repository.interface';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { Price } from '../../domain/value-objects/price.vo';
import { SKU } from '../../domain/value-objects/sku.vo';
import { StockLevel } from '../../domain/value-objects/stock-level.vo';
import { ProductCreatedEvent } from '../../domain/events/product-created.event';
import { IEventPublisher } from 'src/modules/merchant-auth/domain/interfaces/event-publisher.interface';
import { ReorderPoint } from '../../domain/value-objects/reorder-point.vo';

export class CreateProductDto {
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  reorderPoint: number;
  hasVariants: boolean;
  variants?: Array<{
    sku: string;
    attributes: Record<string, string>;
    costPrice: number;
    sellingPrice: number;
    initialStock?: number;
    reorderPoint?: number;
  }>;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepo: IProductRepository,
    @Inject(IProductVariantRepository)
    private readonly productVariantRepo: IProductVariantRepository,
    // private readonly emitBus: IEventPublisher,
    // private eventBus : EventBus
  ) {}

  logger = new Logger(CreateProductUseCase.name)

  async execute(dto: CreateProductDto, merchantId: string) {

    this.logger.log(merchantId)
    // 1. Check for duplicate SKUs if variants provided
    if (dto.hasVariants && dto.variants) {
      for (const variantDto of dto.variants) {
        const existing = await this.productVariantRepo.findBySKU(
          variantDto.sku,
          merchantId,
        );

        if (existing) {
          throw new ConflictException(`SKU ${variantDto.sku} already exist`);
        }
      }
    }

    this.logger.log(
      dto.name,
      merchantId,
      dto.categoryId,
      dto.basePrice,
      dto.reorderPoint,
      dto.hasVariants,
      dto.description,
    );
    // create Product entity
    const product = Product.create(
      dto.name,
      merchantId,
      dto.categoryId,
      dto.basePrice,
      dto.reorderPoint,
      dto.hasVariants,
      dto.description,
    );

    const savedProduct = await this.productRepo.save(product);

    if (dto.hasVariants && dto.variants) {
      // id?: string | undefined;
      //    productId: string;
      //    sku: SKU;
      //    attributes: VariantAttributes;
      //    costPrice: Price;
      //    sellingPrice: Price;
      //    stockLevel: StockLevel;
      //    reorderPoint?: ReorderPoint;
      //    supplierInfo?: Record<string, any>;
      // etimsItemCode?: string;
      for (const variantDto of dto.variants) {
        const variant = ProductVariant.create({
          productId: savedProduct.id,
          sku: new SKU(variantDto.sku),
          attributes: variantDto.attributes,
          costPrice: new Price(variantDto.costPrice),
          sellingPrice: new Price(variantDto.sellingPrice),
          stockLevel: new StockLevel(variantDto.initialStock || 0),
          // todo create a ReorderPoint VO
          reorderPoint: variantDto.reorderPoint
            ? new ReorderPoint(variantDto.reorderPoint)
            : undefined,
        });

        await this.productVariantRepo.save(variant);
      }
    }

    // todo research about EventBus
    // emit aEvent
    // this.emitBus.publish(
    //   new ProductCreatedEvent(savedProduct.id, merchantId, savedProduct.name),
    // );
    //

    return { productId: savedProduct.id };
  }
}
