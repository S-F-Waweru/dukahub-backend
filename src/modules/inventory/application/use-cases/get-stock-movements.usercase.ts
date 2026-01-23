import {IStockMovementRepository} from "../../domain/interface/stock-movement.repsotory.interface";
import {Inject} from "@nestjs/common";

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