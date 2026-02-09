import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {IProductRepository} from "../../domain/interface/product-repository.interface";
import {UpdateProductDto} from "../../presentation/dtos/update-product.dto";

@Injectable()
export class UpdateProductUseCase {
constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
) {}

    async execute(id: string, dto: UpdateProductDto, merchantId: string) {
     const  product = await this.productRepository.findById(id)
        if (!product) {
            throw new NotFoundException('Product not found');
        }

      product.update(dto)

        await this.productRepository.update(product)
        return product
    }
}