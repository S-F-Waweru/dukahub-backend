export interface ISupplierRepository {
  create(supplier: any): Promise<any>;
  findById(id: string, merchantId: string): Promise<any>;
  findByMerchant(merchantId: string, pagination: any): Promise<any[]>;
  update(id: string, data: any, merchantId: string): Promise<any>;
  delete(id: string, merchantId: string): Promise<void>;
  search(query: string, merchantId: string): Promise<any[]>;
}

export const ISupplierRepository  = Symbol ('ISupplierRepository')