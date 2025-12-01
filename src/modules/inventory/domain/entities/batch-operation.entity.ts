import { BaseEntity } from 'src/shared/domain/base.entity';

export class BatchOperation extends BaseEntity {
  constructor(props: {
    id: string;
    merchantId: string;
    type: string;
    status: string;
    totalItems: number;
    processedItems: number;
    failedItems: number;
    userId: string;
    createdAt: Date;
    completedAt?: Date;
  }) {
    super(props.id);
  }

  updateProgress(processed: number, failed: number) {}
  markComplete() {}
  hasFailed() {}
}
