import {Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {ProductVariantSchema} from "./product-variant.schema";

@Entity('products')
@Index(['merchantId'])
@Index(['categoryId'])
export  class ProductSchema {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    merchantId: string;

    @Column({type : 'uuid'})
    categoryId: string;

    @Column()
    name : string

    @Column({type : 'text', nullable :true})
    description : string

    @Column({default :false})
    hasVariants :boolean

    @Column({type :"decimal", precision :10, scale:2})
    basePrice: number

    @Column({type :'integer', default :0})
    reorderPoint : number

    @Column({default :true})
    isActive : boolean


    @OneToMany(() => ProductVariantSchema, variant => variant.product)
    variants: ProductVariantSchema[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    @DeleteDateColumn()
    deletedAt: Date | null;
}