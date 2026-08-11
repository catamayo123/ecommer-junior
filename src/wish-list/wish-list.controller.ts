import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWhishListDTO } from './DTO/create-wishList.dto';
import { WishListService } from './wish-list.service';

@Controller('wish-list')
@UseGuards(JwtAuthGuard)
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  // CREAR RESEÑA
  @Post('crear')
  createReview(@CurrentUser('id') userId: string, @Body() creteDTO: CreateWhishListDTO) {
    return this.wishListService.createWishList(userId, creteDTO);
  }

  // LISTAR RESEÑAS POR PRODUCTID
  @Get('findAll')
  finAllReviewByProduct(@CurrentUser('id') userId: string) {
    return this.wishListService.findALLWishList(userId);
  }

  // DELETE RESEÑAS
  @Delete('delete/:id')
  deleteReview(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.wishListService.deleteWishList(id, userId);
  }
}
