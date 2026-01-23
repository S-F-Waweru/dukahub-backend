import {Injectable} from "@nestjs/common";
import {IStockMovementRepository} from "../../../domain/interface/stock-movement.repsotory.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {StockMovementSchema} from "../schema/stock-movement.schema";
import {Repository} from "typeorm";
import {MovementType, StockMovement} from "../../../domain/entities/stock-movement.entity";

@Injectable()
export class StockMovementRepository implements IStockMovementRepository {
    constructor(
        @InjectRepository(StockMovementSchema)
        private repo: Repository<StockMovementSchema>,
    ) {}

    async save(movement: StockMovement): Promise<StockMovement> {
        const schema = this.toSchema(movement);
        const saved = await this.repo.save(schema);
        return this.toDomain(saved);
    }

    async findByVariantId(variantId: string, limit: number = 50): Promise<StockMovement[]> {
        const schemas = await this.repo.find({
            where: { variantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return schemas.map(s => this.toDomain(s));
    }

    async findByMerchantId(
        merchantId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<StockMovement[]> {
        const schemas = await this.repo
            .createQueryBuilder('movement')
            .where('movement.merchantId = :merchantId', { merchantId })
            .andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .orderBy('movement.createdAt', 'DESC')
            .getMany();

        return schemas.map(s => this.toDomain(s));
    }

    async getTotalStockOutValue(
        merchantId: string,
        month: number,
        year: number,
    ): Promise<number> {
        const result = await this.repo
            .createQueryBuilder('movement')
            .select('SUM(movement.quantity * movement.unitCost)', 'total')
            .where('movement.merchantId = :merchantId', { merchantId })
            .andWhere('movement.movementType = :type', { type: MovementType.STOCK_OUT })
            .andWhere('EXTRACT(MONTH FROM movement.createdAt) = :month', { month: month + 1 })
            .andWhere('EXTRACT(YEAR FROM movement.createdAt) = :year', { year })
            .getRawOne();

        return parseFloat(result?.total || 0);
    }

    private toSchema(movement: StockMovement): StockMovementSchema {
        const schema = new StockMovementSchema();
        schema.id = movement.id;
        schema.variantId = movement.variantId;
        schema.merchantId = movement.merchantId;
        schema.movementType = movement.movementType;
        schema.quantity = movement.quantity;
        schema.previousStock = movement.previousStock;
        schema.newStock = movement.newStock;
        schema.performedBy = movement.performedBy;
        return schema;
    }

    private toDomain(schema: StockMovementSchema): StockMovement {
        return StockMovement.create(
            schema.variantId,
            schema.merchantId,
            schema.movementType as MovementType,
            schema.quantity,
            schema.previousStock,
            schema.newStock,
            schema.performedBy,
        );
    }
}