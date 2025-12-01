export interface IProductRepository {
  create(product: any): Promise<any>;
  findById(id: string, merchantId: string): Promise<any>;
  findBySku(sku: string, merchantId: string): Promise<any>;
  findByMerchant(
    merchantId: string,
    filters: any,
    pagination: any,
  ): Promise<any>;
  update(id: string, data: any, merchantId: string): Promise<any>;
  delete(id: string, merchantId: string): Promise<void>;
  search(query: string, merchantId: string): Promise<any[]>;
  findLowStock(merchantId: string): Promise<any[]>;
  findByCategory(categoryId: string, merchantId: string): Promise<any[]>;
  findBySupplier(supplierId: string, merchantId: string): Promise<any[]>;
  getTotalValue(merchantId: string): Promise<number>;
}
const IProductRepository = Symbol('IProductRepsitory');
