import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../domain/interface/product-repository.interface';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}
  async execute(id: string, merchantId: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(product.id);
  }
}
