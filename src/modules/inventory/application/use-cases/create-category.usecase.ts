import { Injectable, Inject } from '@nestjs/common';
import { Category, CategoryType } from '../../domain/entities/category.entity';
import { ICategoryRepository } from '../../domain/interfaces/category-repository.interface';

export class CreateCategoryDto {
    name: string;
    type: CategoryType;
    merchantId?: string;
}

@Injectable()
export class CreateCategoryUseCase {
    constructor(
        @Inject(ICategoryRepository)
        private categoryRepo: ICategoryRepository,
    ) {}

    async execute(dto: CreateCategoryDto): Promise<{ categoryId: string }> {
        const category = Category.create(dto.name, dto.type, dto.merchantId);
        const saved = await this.categoryRepo.save(category);
        return { categoryId: saved.id };
    }
}