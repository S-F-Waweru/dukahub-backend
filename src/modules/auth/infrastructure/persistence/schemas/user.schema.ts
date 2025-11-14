import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['merchantId'])
@Index(['phoneNumber'])
@Index(['status'])
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  email: string;
  @Column({ nullable: true })
  passwordHash: string;
  @Column({ nullable: true })
  phoneNumber: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ nullable: true })
  profilePhotoUrl: string;
  @Column({ type: 'uuid' })
  merchantId: string;
  @Column({ default: 'LOCAL' })
  authProvider: string;
  @Column({ default: false })
  isEmailVerified: boolean;
  @Column({ default: 'ACTIVE' })
  status: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
