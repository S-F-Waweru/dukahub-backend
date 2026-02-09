import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { MerchantType } from '../../../domain/enums/merchant-type.enum';
import { MerchantStatus } from '../../../domain/enums/merchant-status.enum';

@Entity('merchants')
@Index(['email'], { unique: true })
@Index(['status'])
export class MerchantSchema {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    businessName: string;

    @Column({
        type: 'enum',
        enum: MerchantType,
    })
    type: MerchantType;

    @Column()
    phoneNumber: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    physicalAddress: string;

    @Column({ nullable: true })
    kraPin: string;

    @Column({ nullable: true })
    mpesaTill: string;

    @Column({ nullable: true })
    airtelMoneyNumber: string;

    @Column({
        type: 'enum',
        enum: MerchantStatus,
        default: MerchantStatus.ACTIVE,
    })
    status: MerchantStatus;

    @Column({ default: 'FREE' })
    subscriptionTier: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    onboardedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}