import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import { IProductRepository } from '../../domain/interfaces/product-repository.interface';
import { IProductVariantRepository } from '../../domain/interfaces/product-variant.repository.interface';

@Injectable()
export class GetProductUseCase {
    constructor(
        @Inject(IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(IProductVariantRepository)
        private readonly productVariantRepository: IProductVariantRepository,
    ) {
    }

    // todo add the variants and use the merchantId
    async  execute(id: string, merchantId: string) {
        const product = await this.productRepository.findById(id);
        if(!product){
            throw  new NotFoundException(`Product with id ${id} not found`)
        }

        const variants = await  this.productVariantRepository.findByProductId(product.id)

        return {
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
        }
    }

}