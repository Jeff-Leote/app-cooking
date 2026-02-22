import { IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  quantite?: string;

  @IsOptional()
  @IsDateString()
  date_peremption?: string;
}
