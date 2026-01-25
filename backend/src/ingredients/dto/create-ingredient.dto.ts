import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';

const MAX_NAME_LENGTH = 255;

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  nom: string;

  @IsOptional()
  @IsBoolean()
  sans_lactose?: boolean;

  @IsOptional()
  @IsBoolean()
  sans_gluten?: boolean;

  @IsOptional()
  @IsBoolean()
  riche_proteines?: boolean;

  @IsOptional()
  @IsBoolean()
  riche_fibres?: boolean;

  @IsOptional()
  @IsBoolean()
  riche_vitamines?: boolean;
}
