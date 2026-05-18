
import {Inject} from "@nestjs/common";
import { IStockMovementRepository } from '../../domain/interfaces/stock-movement.repository.interface';

export class GetStockMovementsUseCase {
    constructor(
    @Inject(IStockMovementRepository)
    private readonly stockMovementRepository: IStockMovementRepository,
    ) {}

    async execute(variantId: string, merchantId: string, limit: number) {
        return this.stockMovementRepository.findByVariantId(
            variantId,
            limit
        );
    }

}