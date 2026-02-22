import { IsArray, ValidateNested, IsInt, IsString, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class RecipeIngredientDto {
  @IsInt()
  ingredient_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  quantite?: string;
}

export class AddRecipeIngredientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
