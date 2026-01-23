import { Inject, Injectable } from '@nestjs/common';
import { VariantNotFoundException } from '../../domain/exceptions/index.exceptions';
import { IProductVariantRepository } from '../../domain/interface/product-variant.repository.interface';
import { MovementType, StockMovement } from '../../domain/entities/stock-movement.entity';
import { IStockMovementRepository } from '../../domain/interface/stock-movement.repsotory.interface';

export class StockInDto {
  variantId: string;
  quantity: number;
  unitCost?: number;
  supplierInfo?: Record<string, any>;
  notes?: string;
}

@Injectable()
export class StockInUsecase {
  constructor(
    @Inject(IProductVariantRepository)
    private readonly variantRepo: IProductVariantRepository,
    @Inject(IStockMovementRepository)
    private readonly movementRepo: IStockMovementRepository,
    // private readonly eventBus: EventBus,
  ) {}

  async execute(dto: StockInDto, userId: string, merchantId: string) {
    // 1. Get variant
    const variant = await this.variantRepo.findById(dto.variantId);
    if (!variant) {
      throw new VariantNotFoundException(dto.variantId);
    }
    const previousStock = variant.currentStock;

    // 2. Increase stock
    variant.increaseStock(dto.quantity);

    // 3. Update variant
    await this.variantRepo.update(variant);

    // 4. Create movement record
    const movement = StockMovement.create(
      variant.id,
      merchantId,
      MovementType.STOCK_IN,
      dto.quantity,
      previousStock,
      variant.currentStock,
      userId,
      dto.unitCost,
      'PURCHASE',
      undefined,
      dto.notes,
    );
    await this.movementRepo.save(movement);

    // 5. Emit event
    // this.eventBus.publish(
    //   new StockLevelChangedEvent(
    //     variant.id,
    //     variant.productId,
    //     merchantId,
    //     previousStock,
    //     variant.currentStock,
    //     MovementType.STOCK_IN,
    //   ),
    // );

    return {
      success: true,
      newStock: variant.currentStock,
      movement: { id: movement.id },
    };
  }
}
