
import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository } from '../../domain/interfaces/product-repository.interface';
import { IProductVariantRepository } from '../../domain/interfaces/product-variant.repository.interface';

@Injectable()
export class GetLowStockProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    @Inject(IProductVariantRepository)
    private readonly productVariantRepository: IProductVariantRepository,
  ) {}

  async execute(merchantId: string) {
    const lowStockVariants =
      await this.productVariantRepository.findLowStock(merchantId);

    return lowStockVariants.map((variant) => ({
      variantId: variant.id,
      productId: variant.productId,
      sku: variant.sku.value,
      currentStock: variant.currentStock,
      reorderPoint: variant.reorderPoint?.value,
      attributes: variant.attributes,
    }));
  }
}
