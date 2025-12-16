export interface IStockMovementRepository {
  create(movement: any): Promise<any>;
  findByProduct(
    productId: string,
    merchantId: string,
    pagination: any,
  ): Promise<any>;
  findByMerchant(
    merchantId: string,
    filters: any,
    pagination: any,
  ): Promise<any>;
  findByDateRange(merchantId: string, start: Date, end: Date): Promise<any>;
  findByType(merchantId: string, type: string, pagination: any): Promise<any>;
}

export const IStockMovementRepository = Symbol('IStockMovementRepository');
