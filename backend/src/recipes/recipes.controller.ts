import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AddRecipeIngredientsDto } from './dto/add-recipe-ingredients.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto)
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('favorites') favorites?: string,
  ) {
    return this.recipesService.findAll({ category, search, favorites: favorites === 'true' })
  }

  @Post(':id/ingredients')
  @HttpCode(HttpStatus.OK)
  addIngredients(
    @Param('id', ParseIntPipe) id: number,
    @Body() addRecipeIngredientsDto: AddRecipeIngredientsDto,
  ) {
    return this.recipesService.addIngredients(id, addRecipeIngredientsDto.ingredients)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto)
  }

  @Patch(':id/favorite')
  @HttpCode(HttpStatus.OK)
  toggleFavorite(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.toggleFavorite(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.remove(id)
  }
}

