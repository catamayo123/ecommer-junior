import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // BUSCAR TODAS LAS CATEGORIAS  
  async findAllCategory(): Promise<Category[]> {
    // find({ relations: ['children'] }); es para que traiga tambien quienes son sus, subcategoria o hijos
    return this.categoryRepository.find({ relations: ['children'] });
  }

  // BUSCAR CATEGORIA POR SU NOMBRE Ejemplo progrmacion-js
  async findCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  // BUSCA HOMEGENEIDAD EN EL NOMBRE DE LA CATEGORIA 
  private generateSlug(name: string): string {
    return name
      .toLowerCase()            // convertir todo el nombre pasado por parametro a minuscula
      .replace(/[^\w\s-]/g, '') // Regex que borra todo lo que no sea letra, número, espacio o guión 
      .replace(/[\s_]+/g, '-')  // Regex que busca los espacios en blanco y ¨_¨ y los remplaza por ¨-¨
      .replace(/-+/g, '-')      // Regex que busca si quedaron ¨-¨ multiples seguidos y los remplaza por uno solo 
      .trim();                  // Regex que borra espacios al inicio y al final de la cadena (por si acaso).
  }
  
  // CREAR CATEGORIAS CON UN MISMO FORMATO DE NOMBRE
  async createCategory(categoryDTO: CreateCategoryDto): Promise<Category> {
    // convertir el nombre a un solo formato nombre-nombre-nombre.....
    const slug = this.generateSlug(categoryDTO.name);
    
    // revisar que el nombre de la categoria no exista en BD
    const existiCategory = await this.categoryRepository.findOne({ where: { slug } });
    if (existiCategory) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    // si todo va bien crea la categoria y guardala en BD 
    const category = this.categoryRepository.create({ ...categoryDTO, slug });
    return this.categoryRepository.save(category);
  }

  // MODIFICAR CATEGORIA
  async updateCategory(id: string, updateCategoriaDTO: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // si se modifica el nombre conviertelo al fomato adecuado y busca la categoria.  
    if (updateCategoriaDTO.name) {
      const slug = this.generateSlug(updateCategoriaDTO.name);
      const existiCategory = await this.categoryRepository.findOne({ where: { slug } });

      // Si existe la cat con ese nombre pero su id es diferente, es que ya existe otra cat con ese nombre y no se modifica nada
      if (existiCategory && existiCategory.id !== id) {
        throw new ConflictException('Ya existe otra categoría con ese nombre');
      }

      // si pasan todas las validaciones asigna a la cat encontrada por el ID el slug homogenizado
      category.slug = slug;
    }

    // Coipia con assign del objeto de destino category todas las propiedades del objeto origen updateCategoriaDTO
    Object.assign(category, updateCategoriaDTO);
    return this.categoryRepository.save(category);
  }

  // ELIMINAR CATEGORIA
  async removeCategory(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
 
}
