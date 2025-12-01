import { BaseEntity } from 'src/shared/domain/base.entity';

export class StockMovement extends BaseEntity {
  constructor(props: {
    id: string;
    productId: string;
    merchantId: string;
    type: any;
    quantity: any;
    previousQuantity: number;
    newQuantity: number;
    reference?: string;
    notes?: string;
    userId: string;
  }) {
    super(props.id);
  }

  validate() {}
  getMovementDirection() {}
  getNetChange() {}
}
