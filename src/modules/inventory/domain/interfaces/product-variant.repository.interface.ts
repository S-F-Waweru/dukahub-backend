import { ProductVariant } from '../entities/product-variant.entity';
import { SKU } from '../value-objects/sku.vo';

export interface IProductVariantRepository {
  findById(id: string, merchantId?: string): Promise<ProductVariant | null>;
  findBySKU(sku: string, merchantId: string): Promise<ProductVariant | null>
  save(variant: ProductVariant): Promise<ProductVariant>;
  update(variant: ProductVariant): Promise<ProductVariant>;
  findLowStock(merchantIs: string): Promise<ProductVariant[]>;
  findByProductId(productId: string): Promise<ProductVariant[]>;
}

export const IProductVariantRepository = Symbol('IProductVariantRepository');
