import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { PermissionSchema } from './permission.schema';

@Entity('roles')
@Index(['name'], { unique: true })
@Index(['merchantId'])
@Index(['isSystemRole'])
export class RoleSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'SUPER_ADMIN', 'ADMIN', 'MANAGER'

  @Column()
  displayName: string; // e.g., 'Super Administrator'

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystemRole: boolean; // Cannot be deleted

  @Column({ type: 'uuid', nullable: true })
  merchantId: string; // null for system-wide roles

  @ManyToMany(() => PermissionSchema)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionSchema[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
