import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/interfaces/category-repository.interface';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(ICategoryRepository)
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(merchantId: string) {
    const [system, merchant] = await Promise.all([
      this.categoryRepo.findSystemCategories(),
      this.categoryRepo.findByMerchantId(merchantId),
    ]);

    return [...system, ...merchant].map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      isSystemCategory: c.isSystemCategory,
    }));
  }
}
