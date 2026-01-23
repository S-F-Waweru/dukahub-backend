import { ProductVariant } from '../entities/product-variant.entity';
import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByMerchantId(merchantId: string): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product[]>;
  delete(id: string): Promise<void>;
  findLowstock(merchantId: string): Promise<Product[]>;
}

export const IProductRepository = Symbol('IProductRepository');
