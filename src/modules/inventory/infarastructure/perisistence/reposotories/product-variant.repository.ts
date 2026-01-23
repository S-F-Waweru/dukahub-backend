import {Injectable} from "@nestjs/common";
import {ProductVariantSchema} from "../schema/product-variant.schema";
import { Repository } from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {IProductVariantRepository} from "../../../domain/interface/product-variant.repository.interface";
import {ProductVariant} from "../../../domain/entities/product-variant.entity";

@Injectable()
export class ProductVariantRepository implements IProductVariantRepository {
    constructor(
        @InjectRepository(ProductVariantSchema)
        private repo: Repository<ProductVariantSchema>,
    ) {}

    async findById(id: string): Promise<ProductVariant | null> {
        const schema = await this.repo.findOne({ where: { id } });
        return schema ? this.toDomain(schema) : null;
    }

    async findBySKU(sku: string, merchantId: string): Promise<ProductVariant | null> {
        const schema = await this.repo
            .createQueryBuilder('variant')
            .innerJoin('variant.product', 'product')
            .where('variant.sku = :sku', { sku: sku.toUpperCase() })
            .andWhere('product.merchantId = :merchantId', { merchantId })
            .getOne();

        return schema ? this.toDomain(schema) : null;
    }

    async findByProductId(productId: string): Promise<ProductVariant[]> {
        const schemas = await this.repo.find({ where: { productId } });
        return schemas.map(s => this.toDomain(s));
    }

    async save(variant: ProductVariant): Promise<ProductVariant> {
        const schema = this.toSchema(variant);
        const saved = await this.repo.save(schema);
        return this.toDomain(saved);
    }

    async update(variant: ProductVariant): Promise<ProductVariant> {
        const schema = this.toSchema(variant);
        await this.repo.save(schema);
        return variant;
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findLowStock(merchantId: string): Promise<ProductVariant[]> {
        const schemas = await this.repo
            .createQueryBuilder('variant')
            .innerJoin('variant.product', 'product')
            .where('product.merchantId = :merchantId', { merchantId })
            .andWhere(
                '(variant.currentStock <= COALESCE(variant.reorderPoint, product.reorderPoint))'
            )
            .getMany();

        return schemas.map(s => this.toDomain(s));
    }

    private toSchema(variant: ProductVariant): ProductVariantSchema {
        const schema = new ProductVariantSchema();
        schema.id = variant.id;
        schema.productId = variant.productId;
        schema.sku = variant.sku.value;
        schema.attributes = variant.attributes as Record<string, any>;
        schema.costPrice = variant.costPrice.value;
        schema.sellingPrice = variant.sellingPrice.value;
        schema.currentStock = variant.currentStock;
        if (variant.reorderPoint){
            schema.reorderPoint = variant.reorderPoint?.value;
    }
        if(variant.supplierInfo){
            schema.supplierInfo = variant.supplierInfo;
        }
        if(variant.etimsItemCode){
            schema.etimsItemCode = variant.etimsItemCode;
        }

        return schema;
    }

    private toDomain(schema: ProductVariantSchema): ProductVariant {
        return ProductVariant.fromPersistence({
            id: schema.id,
            productId: schema.productId,
            sku: schema.sku,
            attributes: schema.attributes,
            costPrice: schema.costPrice,
            sellingPrice: schema.sellingPrice,
            currentStock: schema.currentStock,
            reorderPoint: schema.reorderPoint,
            supplierInfo: schema.supplierInfo,
            etimsItemCode: schema.etimsItemCode,
        });
    }
}
