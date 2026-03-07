import { Category } from '../entities/category.entity';

export interface ICategoryRepository {
    findById(id: string): Promise<Category | null>;
    findByMerchantId(merchantId: string): Promise<Category[]>;
    findSystemCategories(): Promise<Category[]>;
    save(category: Category): Promise<Category>;
    delete(id: string): Promise<void>;
}

export const ICategoryRepository = Symbol('ICategoryRepository');