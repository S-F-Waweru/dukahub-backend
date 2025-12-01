export interface ICategoryRepository {
  create(category: any): Promise<any>;
  findById(id: string, merchantId: string): Promise<any>;
  findByMerchant(merchantId: string): Promise<any[]>;
  update(id: string, data: any, merchantId: string): Promise<any>;
  delete(id: string, merchantId: string): Promise<void>;
  findSubcategories(parentId: string, merchantId: string): Promise<any[]>;
}

export const ICategoryRepository = Symbol('ICategoryrepository');
