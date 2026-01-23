
import {AdjustStockDto} from "../../presentation/dtos/adjust-stock.dto";

export  class AdjustStockUseCase {
    constructor(
    ) {
    }

    async execute(dto: AdjustStockDto, userId: string, merchantId: string) {
        const {variantId, newQuantity, reason} = dto
// todo finish on this method : AdjustStockUseCase
    }
}