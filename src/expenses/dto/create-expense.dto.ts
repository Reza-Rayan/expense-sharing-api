import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const MAX_EXPENSE_AMOUNT = 1_000_000;

export class CreateExpenseDto {
  @IsInt()
  @Min(1)
  paidById!: number;

  @IsInt()
  @Min(1)
  paidForId!: number;

  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(MAX_EXPENSE_AMOUNT)
  amount!: number;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;
}
