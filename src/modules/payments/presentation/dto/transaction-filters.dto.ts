// src/modules/payment/presentation/dto/transaction-filters.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransactionStatus } from '../../domain/enums/payament.enum';

export class TransactionFiltersDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus; // ?status=COMPLETED

  @IsOptional()
  @IsDateString()
  from?: string; // ?from=2026-01-01

  @IsOptional()
  @IsDateString()
  to?: string; // ?to=2026-01-31

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
