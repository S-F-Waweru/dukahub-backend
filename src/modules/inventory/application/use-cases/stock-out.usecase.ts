import { Injectable, Inject } from '@nestjs/common';
import { VariantNotFoundException } from '../../domain/exceptions/index.exceptions';
import {
  MovementType,
  StockMovement,
} from '../../domain/entities/stock-movement.entity';
import { IProductVariantRepository } from '../../domain/interfaces/product-variant.repository.interface';
import { IStockMovementRepository } from '../../domain/interfaces/stock-movement.repository.interface';

export class StockOutDto {
  variantId: string;
  quantity: number;
  referenceType?: string; // 'ORDER', 'MANUAL', 'WASTAGE'
  referenceId?: string;
  notes?: string;
}

@Injectable()
export class StockOutUseCase {
  constructor(
    @Inject(IProductVariantRepository)
    private readonly variantRepo: IProductVariantRepository,
    @Inject(IStockMovementRepository)
    private readonly movementRepo: IStockMovementRepository,
    // private eventBus: EventBus,
  ) {}
  async execute(dto: StockOutDto, userId: string, merchantId: string) {
    // 1. get variant
    const variant = await this.variantRepo.findById(dto.variantId, merchantId);
    if (!variant) {
      throw new VariantNotFoundException(dto.variantId);
    }
    // 2 Decrease stock (throws id  insufficient)
    const previousStock = variant.currentStock;
    variant.decreaseStock(dto.quantity);
    // 3. update variant
    await this.variantRepo.update(variant);
    // 4. create movement record
    const movement = StockMovement.create(
      variant.id,
      merchantId,
      MovementType.STOCK_OUT,
      dto.quantity,
      previousStock,
      variant.currentStock,
      userId,
      variant.sellingPrice.value,
      dto.referenceType || 'MANUAL',
      dto.referenceId,
      dto.notes,
    );
    await this.movementRepo.save(movement);
    // 5.emit events
    // 5. Emit events
    // this.eventBus.publish(
    //   new StockLevelChangedEvent(
    //     variant.id,
    //     variant.productId,
    //     merchantId,
    //     previousStock,
    //     variant.currentStock,
    //     MovementType.STOCK_OUT,
    //   ),
    // );
    // check low scock
    // if (variant.hasLowStock()) {
    //   this.eventBus.publish(
    //     new LowStockDetectedEvent(
    //       variant.id,
    //       variant.productId,
    //       merchantId,
    //       variant.currentStock,
    //       variant.reorderPoint?.value || 0,
    //       variant.sku.value,
    //     ),
    //   );
    // }

    // emit for kes 10k threshhold
    const totalValue = dto.quantity * variant.sellingPrice.value;
    //   this.eventBus.publish(
    //     new StockOutProcessedEvent(
    //       variant.id,
    //       merchantId,
    //       dto.quantity,
    //       totalValue,
    //     ),
    //   );

    return {
      success: true,
      newStock: variant.currentStock,
      lowStock: variant.hasLowStock(),
    };
  }
}
