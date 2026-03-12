
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrderItemSchema } from './order-item.schema';
import { CustomerSchema } from './customer.schema';


@Entity('orders')
@Index(['merchantId', 'createdAt'])
@Index(['merchantId', 'status'])
@Index(['orderNumber'], { unique: true })
@Index(['customerId'])
export class OrderSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'uuid' })
  @Index()
  merchantId: string;

  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['POS', 'ONLINE'],
  })
  channel: string;

  @Column({ type: 'jsonb', nullable: true })
  fulfillmentInfo?: any;

  @Column({ type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @OneToMany(() => OrderItemSchema, (item) => item.order, { cascade: true })
  items: OrderItemSchema[];

  @ManyToOne(() => CustomerSchema, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer?: CustomerSchema;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
