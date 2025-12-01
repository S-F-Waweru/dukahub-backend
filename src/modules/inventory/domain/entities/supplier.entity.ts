import { BaseEntity } from 'src/shared/domain/base.entity';

export class Supplier extends BaseEntity {
  constructor(props: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    merchantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(props.id);
  }

  validate() {}
  canBeDeleted() {}
}
