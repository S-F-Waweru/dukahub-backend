import { AdjustStockDto } from '../../presentation/dtos/adjust-stock.dto';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  MovementType,
  StockMovement,
} from '../../domain/entities/stock-movement.entity';
import { IStockMovementRepository } from '../../domain/interfaces/stock-movement.repository.interface';
import { IProductVariantRepository } from '../../domain/interfaces/product-variant.repository.interface';

Injectable();
export class AdjustStockUseCase {
  constructor(
    @Inject(IProductVariantRepository)
    private readonly productVariantRepository: IProductVariantRepository,
    @Inject(IStockMovementRepository)
    private readonly movementRepo: IStockMovementRepository,
  ) {}

  async execute(dto: AdjustStockDto, userId: string, merchantId: string) {
    const { variantId, newQuantity, reason } = dto;

    const variantExist =
      await this.productVariantRepository.findById(variantId);

    if (!variantExist) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }
    const previousStock = variantExist.currentStock;
    const quantityDifference = newQuantity - variantExist.currentStock;

    if (quantityDifference > 0) {
      variantExist.decreaseStock(quantityDifference);
    } else {
      variantExist.increaseStock(quantityDifference);
    }

    // 4. Create movement record
    const movement = StockMovement.create(
      variantExist.id,
      merchantId,
      MovementType.STOCK_ADJUSTMENT,
      newQuantity,
      previousStock,
      variantExist.currentStock,
      userId,
      // todo chack the price if it is unit or current price
      variantExist.sellingPrice.value,
      'STOCK_ADJUSTMENT',
      undefined,
      reason,
    );
    await this.movementRepo.save(movement);

    return movement;
  }
}
