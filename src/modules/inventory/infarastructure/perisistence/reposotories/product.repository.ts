import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {IProductRepository} from "../../../domain/interface/product-repository.interface";
import {Injectable, NotFoundException} from "@nestjs/common";
import {ProductSchema} from "../schema/product.schema";
import { Product } from "src/modules/inventory/domain/entities/product.entity";

@Injectable()
export class ProductRepository implements IProductRepository {
 constructor(
     @InjectRepository(ProductSchema)
     private readonly repository: Repository<ProductSchema>
 ) {
 }

 async findById(id: string): Promise<Product | null> {
        const  schema = await this.repository.findOne({
         where : {id}
        })
   return  schema ? this.toDomain(schema) : null;
    }
    async findByMerchantId(merchantId: string): Promise<Product[]> {
       const  schemas = await this.repository.find({
        where : {merchantId},
        order :{createdAt : 'DESC'}
       })
     return  schemas.map(schema => this.toDomain(schema));
    }
    async findByCategory(merchantId: string, categoryId: string): Promise<Product[]> {
        const schemas = await this.repository.find ({
            where : {merchantId, categoryId},
            order : {createdAt : 'DESC'}
        })
     return  schemas.map(schema => this.toDomain(schema));
    }
    async save(product: Product): Promise<Product> {
        const schema = this.toSchema(product)
       const saved = await this.repository.save(schema);
        return  this.toDomain(saved);
    }
    async update(product: Product): Promise<Product> {
     const schema = this.toSchema(product);
     await this.repository.save(schema);
     return product;
    }
    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }
    findLowStock(merchantId: string): Promise<Product[]> {
     //todo implement  the complex joinng query
     // For now, return empty array (implement in variant repo)
        throw new NotFoundException("findLowStock not implemented.");
    }

    toSchema(product: Product ){
     const schema = new ProductSchema();
     schema.id = product.id;
     schema.merchantId = product.merchantId;
     schema.name = product.name;
     if(product.description){
      schema.description = product.description;
     }
     schema.categoryId = product.categoryId;
     schema.hasVariants = product.hasVariants;
     schema.basePrice = product.basePrice.value;
     schema.reorderPoint = product.reorderPoint.value;
     schema.isActive = product.isActive;
     return schema;
    }

 private toDomain(schema: ProductSchema): Product {
  return Product.fromPersistence({
   id: schema.id,
   name: schema.name,
   description: schema.description,
   merchantId: schema.merchantId,
   categoryId: schema.categoryId,
   hasVariants: schema.hasVariants,
   basePrice: schema.basePrice,
   reorderPoint: schema.reorderPoint,
   isActive: schema.isActive,
  });
 }
 }