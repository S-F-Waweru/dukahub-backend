import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_roles')
@Index(['userId'])
@Index(['roleId'])
export class UserRoleSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  roleId: string;

  @Column({ type: 'uuid', nullable: true })
  assignedBy: string; // Who assigned this role

  @CreateDateColumn()
  assignedAt: Date;
}
