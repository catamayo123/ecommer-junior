import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAllProducts(@Query() queryProductDTO: QueryProductDto) {
    return this.productsService.findAllProducts(queryProductDTO);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  findAllProductsAdmin(@Query() query: QueryProductDto) {
    return this.productsService.findAllProductsAdmin(query);
  }

  @Get(':slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findProductBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  removeProduct(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }
  // GUARDAR PORTADA
  @Post('upload-cover/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  // INTERCEPTOR para (validar, generar nombre aleatorio, guardar HDD los archivos
  @UseInterceptors(FileInterceptor('coverImage', {
    storage: diskStorage({                                              // guardar archivo en el HDD y no en memoria
      destination: join(__dirname, '..', '..', 'uploads', 'portadas'),  // ubucacion donde se guardara el archivo 

      filename: (req, file, cb) => {                                    // funcion para generar el nombre del archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Milisegundos actuales + un numero rando de 9 digitos
        cb(null, uniqueSuffix + extname(file.originalname)); // nombre generado + extension original del archivo
      },
    }),
    // validar el tipo de archivo antes de guardarlo 
    fileFilter: (req, file, cb) => { 
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {   // Regex que solo acepta tipos que empiecen con image/ y terminen en jpeg, png, webp o gif
        cb(new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'), false);
      } else {
        cb(null, true); // si el cb anterior no lanza error, permite guardar el archivo 
      }
    },
  }))
  // Funcion para cargar la imagen en el parametro File despues que UseInterceptors(FileInterceptor) hizo su trabajo
  async uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes subir una imagen');
    }
    const coverPath = `uploads/portadas/${file.filename}`; 
    return this.productsService.updateProduct(id, { coverImage: coverPath } as UpdateProductDto);
  }
  // GUARDAR ARCHIVO
  @Post('upload-file/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads', 'archivos'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes subir un archivo');
    }
    const filePath = `uploads/archivos/${file.filename}`;
    return this.productsService.updateProduct(id, { fileName: filePath } as UpdateProductDto);
  }
}
