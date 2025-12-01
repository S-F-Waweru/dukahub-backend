import { BaseEntity } from 'src/shared/domain/base.entity';

export class StockAlert extends BaseEntity {
  constructor(props: {
    id: string;
    productId: string;
    merchantId: string;
    alertType: string;
    isRead: boolean;
    createdAt: Date;
  }) {
    super(props.id);
  }

  markAsRead() {}
  isExpired() {}
}
