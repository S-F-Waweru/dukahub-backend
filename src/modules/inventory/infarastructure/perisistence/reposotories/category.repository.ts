import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CategorySchema } from '../schema/category.schema';
import { ICategoryRepository } from '../../../domain/interface/category-repository.interface';
import { Category, CategoryType } from '../../../domain/entities/category.entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
    constructor(
        @InjectRepository(CategorySchema)
        private repo: Repository<CategorySchema>,
    ) {}

    async findById(id: string): Promise<Category | null> {
        const schema = await this.repo.findOne({ where: { id } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByMerchantId(merchantId: string): Promise<Category[]> {
        const schemas = await this.repo.find({ where: { merchantId } });
        return schemas.map((s) => this.toDomain(s));
    }

    async findSystemCategories(): Promise<Category[]> {
        const schemas = await this.repo.find({ where: { merchantId: IsNull() } });
        return schemas.map((s) => this.toDomain(s));
    }

    async save(category: Category): Promise<Category> {
        const schema = this.toSchema(category);
        const saved = await this.repo.save(schema);
        return this.toDomain(saved);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    private toSchema(category: Category): CategorySchema {
        const schema = new CategorySchema();
        schema.id = category.id;
        schema.name = category.name;
        schema.type = category.type;
        schema.merchantId = category['_merchantId']!;
        schema.isActive = category['_isActive'];
        return schema;
    }

    private toDomain(schema: CategorySchema): Category {
        return new Category({
            id: schema.id,
            name: schema.name,
            type: schema.type as CategoryType,
            merchantId: schema.merchantId,
            isActive: schema.isActive,
        });
    }
}