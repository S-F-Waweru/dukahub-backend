import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['resource'])
@Index(['action'])
export class PermissionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'users_create', 'products_view'

  @Column()
  resource: string; // e.g., 'users', 'products', 'sales'

  @Column()
  action: string; // e.g., 'create', 'view', 'update', 'delete'

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
