import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './DTO/create-category.dto';
import { UpdateCategoryDTO } from './DTO/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../enum/index';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  // BUSCAR TODOS 
  @Get('findAll')
  findAllCategory() {
    return this.categoriesService.findAllCategory();
  }
  // BUSCAR CAT POR SU SLUG CON EL @Param('slug')
  @Get('find/:slug')
  findCategoryBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findCategoryBySlug(slug);
  }
  // CREAR CAT (SOLO ADMIN)
  @Post('createdCat')
  @UseGuards(JwtAuthGuard, RolesGuard) // necesita autenticacion JWT para ser creada la cat 
  @Roles(UserRole.ADMIN)  // Tienes que ser rol admin para poder crearla cat
  createCategory(@Body() createDTO: CreateCategoryDTO) {
    return this.categoriesService.createCategory(createDTO);
  }

  // MODIFICAR (SOLO ADMIN)
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(UserRole.ADMIN)
  updateCategory(@Param('id') id: string, @Body() updateDTO: UpdateCategoryDTO) {
    return this.categoriesService.updateCategory(id, updateDTO);
  }

  // ELIMINAR (SOLO ADMIN)
  @Delete('delete/:id') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeCategory(@Param('id') id: string) {
    return this.categoriesService.removeCategory(id);
  }
}
