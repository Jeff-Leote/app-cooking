import { IsString, IsOptional, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { IngredientCategory } from '@prisma/client';

const MAX_NAME_LENGTH = 255;

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  nom: string;

  @IsOptional()
  @IsEnum(IngredientCategory)
  categorie?: IngredientCategory;
}
