import {Inject, Injectable} from "@nestjs/common";
import {IProductVariantRepository} from "../../domain/interface/product-variant.repository.interface";
import {IProductRepository} from "../../domain/interface/product-repository.interface";

@Injectable()
export class ListProductUseCase {
    constructor(
        @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
        @Inject(IProductVariantRepository)
        private readonly productVariantRepository: IProductVariantRepository
    ) {
    }

    //todo add pagination,
    async execute(merchantId:  string, categoryId?: string){
        const products = categoryId ?
            await this.productRepository.findByCategory(
            merchantId, categoryId
        ) :
            await this.productRepository.findByMerchantId(merchantId);

        //todo make this in the repository instead
        const results = []
        for ( const  product of products) {
            const variants = await  this.productVariantRepository.findByProductId(product.id)
            results.push({
                id: product.id,
                name: product.name,
                description: product.description,
                basePrice: product.basePrice.value,
                totalStock: product.getTotalStock(),
                hasLowStock: product.hasLowStock(),
                isActive: product.isActive,
                variants: variants.map(v => ({
                    id: v.id,
                    sku: v.sku.value,
                    attributes: v.attributes,
                    currentStock: v.currentStock,
                    sellingPrice: v.sellingPrice.value,
            }))
        })
    }
        return results
    }
}