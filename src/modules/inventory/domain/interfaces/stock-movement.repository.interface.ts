import { StockMovement } from '../entities/stock-movement.entity';

export interface IStockMovementRepository {
  save(movement: StockMovement): Promise<StockMovement>;
  findByVariantId(
    variantId: string,
    merchantId: string,
    limit: number,
  ): Promise<StockMovement[]>;

  findByMerchantId(
    merchantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockMovement[]>;

  getTotalStockOutValue(
    merchantId: string,
    month: number,
    year: number,
  ): Promise<number>;
}
export const IStockMovementRepository = Symbol('IStockMovementRepository');
