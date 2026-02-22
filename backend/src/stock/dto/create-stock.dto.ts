import { IsInt, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

export class CreateStockDto {
  @IsInt()
  ingredient_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  quantite?: string;

  @IsOptional()
  @IsDateString()
  date_peremption?: string;
}
