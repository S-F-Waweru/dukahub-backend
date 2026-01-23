import {IProductVariantRepository} from "../../domain/interface/product-variant.repository.interface";
import {Inject, Injectable} from "@nestjs/common";
import {IProductRepository} from "../../domain/interface/product-repository.interface";

@Injectable()
export class GetLowStockProductUseCase {
    constructor(
        @Inject(IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(IProductVariantRepository)
    private  readonly  productVariantRepository: IProductVariantRepository
    ) {}

    async execute(merchantId: string){
        const lowStockVariants = await this.productVariantRepository.findLowStock(merchantId);

        return lowStockVariants.map(variant => (
            {
                variantId: variant.id,
                productId: variant.productId,
                sku: variant.sku.value,
                currentStock: variant.currentStock,
                reorderPoint: variant.reorderPoint?.value,
                attributes: variant.attributes,
            }
        ))
    }
}