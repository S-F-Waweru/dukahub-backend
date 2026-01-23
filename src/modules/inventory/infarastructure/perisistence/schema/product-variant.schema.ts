import {
    Column,
    CreateDateColumn, DeleteDateColumn, Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { ProductSchema } from "./product.schema";

@Entity('product_variants')
@Index(['sku'], { unique: true })
@Index(['productId'])
export class ProductVariantSchema {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @Column({ unique: true })
    sku: string;

    @Column({ type: 'jsonb' })
    attributes: Record<string, string>;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    costPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    sellingPrice: number;

    @Column({ type: 'integer', default: 0 })
    currentStock: number;

    @Column({ type: 'integer', nullable: true })
    reorderPoint: number;

    @Column({ type: 'jsonb', nullable: true })
    supplierInfo: Record<string, any>;

    @Column({ nullable: true })
    etimsItemCode: string;

    @ManyToOne(() => ProductSchema, product => product.variants)
    @JoinColumn({ name: 'product_id' })
    product: ProductSchema;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    @DeleteDateColumn()
    deletedAt: Date | null;
}