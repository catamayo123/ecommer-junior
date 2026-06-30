import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAllProducts(query: QueryProductDto) {
    const { searchName, categoryId, productType, minPrice, 
            maxPrice, page = 1, limit = 10, sortBy 
          = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (searchName) {
      queryBuilder.andWhere('product.name LIKE :searchName', { searchName: `%${searchName}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (productType) {
      queryBuilder.andWhere('product.productType = :productType', { productType });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const allowedSortFields = ['price', 'name', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? `product.${sortBy}` : 'product.createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(sortField, order);

    const total = await queryBuilder.getCount();
    const products = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllProductsAdmin() {
    return this.productRepository.find({ relations: ['category'] });
  }

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

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);

    const existingProduct = await this.productRepository.findOne({ where: { slug } });
    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    const product = this.productRepository.create({ ...createProductDto, slug });
    return this.productRepository.save(product);
  }

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

  async removeProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
  }
}
