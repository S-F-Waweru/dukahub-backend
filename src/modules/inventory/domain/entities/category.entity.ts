import { BaseEntity } from 'src/shared/domain/base.entity';

export class Category extends BaseEntity {
  constructor(props: {
    id: string;
    name: string;
    description?: string;
    merchantId: string;
    parentCategoryId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(props.id);
  }

  isSubcategory() {}
  validate() {}
}
