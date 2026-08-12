import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReviewDTO } from './DTO/create-review.dto';
import { UpdateReviewDTO } from './DTO/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  // CREAR RESEÑA
  @Post('crear')
  @UseGuards(JwtAuthGuard)
  createReview(@CurrentUser('id') userId: string, @Body() creteDTO: CreateReviewDTO) {
    return this.reviewsService.createReview(userId, creteDTO);
  }

  // LISTAR RESEÑAS POR PRODUCTID
  @Get('product/:productId')
  finAllReviewByProduct(@Param('productId') productId: string) {
    return this.reviewsService.finAllReviewByProduct(productId);
  }

  // MODIFICAR RESEÑAS
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDTO: UpdateReviewDTO) {
    return this.reviewsService.updateReview(userId, id, updateDTO);
  }

  // DELETE RESEÑAS
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteReview(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
