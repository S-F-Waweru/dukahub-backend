import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/interface/category-repository.interface';

@Injectable()
export class GetCategoryUseCase {
  constructor(
    @Inject(ICategoryRepository)
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      isSystemCategory: category.isSystemCategory,
    };
  }
}