import { MovementType } from "../entities/stock-movement.entity";

export class StockLevelChangedEvent {
  constructor(
    public readonly variantId: string,
    public readonly productId: string,
    public readonly merchantId: string,
    public readonly previousStock: number,
    public readonly newStock: number,
    public readonly movementType: MovementType,
    public readonly timestamp: Date = new Date(),
  ) {}
}
