import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }
  // BUSCAR TODOS LOS PRODUCTOS 
  /*
    Este devuelve una promesa con un objeto paginado de 10 en 10 de todos los productos existentes
    Se utilizan parametros vinculados para tomar isActive como un string literal. Esto impide que se pase 
    (true; DROP TABLE products) y SQL tome DROP TABLE products, como comando, con los parametros vinculados
    SQL lo toma de forma sting literal, como una cadena de texto para ser mas preciso y no como una claupsula SQL
  */
  async findAllProducts(queryDTO: QueryProductDto) {

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category') // trayendo a que cat pertenece ese producto 
      .where('product.isActive = :isActive', { isActive: true });  // parametro vinculado

    // A partir de la busqueda anterior queryBuilder empezar a agg paramtros de busquedas. En este caso busqueda parcial 
    // si se introduce searchName. Filtrame todo los nombres que contengan ese nombre
    if (queryDTO.searchName) {
      queryBuilder.andWhere('product.name LIKE :searchName', { searchName: `%${queryDTO.searchName}%` }); // parametro vinculado
    }

    // Filtra productos por esa cat exacta si se enviaron cat
    if (queryDTO.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: queryDTO.categoryId });
    }

    // Filtra por el tipo de producto si se enviaron. Si mandan cursos solo muestra los cursos y asi  
    if (queryDTO.productType) {
      queryBuilder.andWhere('product.productType = :productType', { productType: queryDTO.productType });
    }

    // Filtrar productos por el precio min ->
    if (queryDTO.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: queryDTO.minPrice });
    }
    // - > Y hasa el precio maximo 
    if (queryDTO.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: queryDTO.maxPrice });
    }

    // ORDENAMIENTO POR LA LISTA QUE SE PUSO del resultado de la busqueda

    const allowedSortFields = ['price', 'name', 'createdAt']; // Lista por donde se puede ordenar  

    const sortField = allowedSortFields.includes(queryDTO.sortBy ?? 'createdAt') // si sortBy esta, ordena por los valores que el traiga sino, por defecto ordena por createdAt

      ? `product.${queryDTO.sortBy}` : 'product.createdAt'; // verifica si el valor esta en la lista blanca, para poder ordenar

    const order = queryDTO.sortOrder === 'ASC' ? 'ASC' : 'DESC'; // Si enviaron ASC ordena por el, sino ordena por defecto por DESC

    queryBuilder.orderBy(sortField, order); // aplica el ORDER BY a la tabla.

    const total = await queryBuilder.getCount(); // cuenta cuantos productos hay sin paginar 
    const products = await queryBuilder
      .skip(((queryDTO.page ?? 1) - 1) * (queryDTO.limit ?? 10)) // selecciona solo los de la ultima pag para saber cuantos hay
      .take(queryDTO.limit ?? 10)     // limita a 10 el numero max de resltados a 10 Limit = 10 en SQL
      .getMany();    // Ejecuta la consulta completa con todos los filtros, devuelve un arr de instancias de productos 

    return {
      data: products,                                         // productos de esa pagina
      total,                                                  // total de productos segun lo buscado
      page: queryDTO.page ?? 1,                               // Pagiana actual del total que hallan 
      limit: queryDTO.limit ?? 10,                            // Total de productos por pagina
      totalPages: Math.ceil(total / (queryDTO.limit ?? 10)),  // Total de paginas redondeando por exceso 
    };
  }

  // BUSCAR TODOS LOS PRODUCTOS PARA EL ADMIN (con paginación, filtros, ordenamiento y sin filtrar por isActive)
  async findAllProductsAdmin(queryDTO: QueryProductDto) {

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (queryDTO.searchName) {
      queryBuilder.andWhere('product.name LIKE :searchName', { searchName: `%${queryDTO.searchName}%` });
    }

    if (queryDTO.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: queryDTO.categoryId });
    }

    if (queryDTO.productType) {
      queryBuilder.andWhere('product.productType = :productType', { productType: queryDTO.productType });
    }

    if (queryDTO.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: queryDTO.minPrice });
    }

    if (queryDTO.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: queryDTO.maxPrice });
    }

    const allowedSortFields = ['price', 'name', 'createdAt'];
    const sortField = allowedSortFields.includes(queryDTO.sortBy ?? 'createdAt')
      ? `product.${queryDTO.sortBy}` : 'product.createdAt';
    const order = queryDTO.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(sortField, order);

    const total = await queryBuilder.getCount();
    const products = await queryBuilder
      .skip(((queryDTO.page ?? 1) - 1) * (queryDTO.limit ?? 10))
      .take(queryDTO.limit ?? 10)
      .getMany();

    return {
      data: products,
      total,
      page: queryDTO.page ?? 1,
      limit: queryDTO.limit ?? 10,
      totalPages: Math.ceil(total / (queryDTO.limit ?? 10)),
    };
  }

  // BUSCAR POR SLUG
  async findProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  // BUSCAR PRODUCTO POR ID 
  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  // CREAR PRODUCTOS
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);

    const existingProduct = await this.productRepository.findOne({ where: { slug } });
    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    const product = this.productRepository.create({ ...createProductDto, slug });
    return this.productRepository.save(product);
  }

  // MODIFICAR PRODUCTOS
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id);

    if (updateProductDto.name) {
      const slug = this.generateSlug(updateProductDto.name);
      const existingProduct = await this.productRepository.findOne({ where: { slug } });

      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('Ya existe otro producto con ese nombre');
      }

      product.slug = slug;
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  // ELIMINAR PRODUCTOS
  async removeProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  // METODO PARA GENERAR EL SLUG AUTOMATICO DEPENDIENDO EL NOMBRE 
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

}
