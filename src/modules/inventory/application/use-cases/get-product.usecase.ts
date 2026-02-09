import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {IProductRepository} from "../../domain/interface/product-repository.interface";

@Injectable()
export class GetProductUseCase {
    constructor(
        @Inject(IProductRepository)
        private readonly productRepository: IProductRepository,
    ) {
    }

    // todo add the variants and use the merchantId
    async  execute(id: string, merchantId: string) {
        const product = await this.productRepository.findById(id);
        if(!product){
            throw  new NotFoundException(`Product with id ${id} not found`)
        }

        return product
    }

}