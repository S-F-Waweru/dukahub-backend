import { ProductVariant } from '../entities/product-variant.entity';
import { SKU } from '../value-objects/sku.vo';

export interface IProductVariantRepository {
  findBySKU(sku: string, merchantId: string): Promise<SKU>;
  save(variant: ProductVariant): Promise<ProductVariant>;
  update(variant: ProductVariant): Promise<ProductVariant>;
  findById(id: string): Promise<ProductVariant>;
  findLowStock(merchantIs: string): Promise<ProductVariant[]>;
  findByProductId(productId: string): Promise<ProductVariant[]>;
}

export const IProductVariantRepository = Symbol('IProductVariantRepository');
