import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly userService: UsersService
    ) { }

    // VER PERFIL DEL USUARIO 
    @Get('seeProfile')
    getProfile(@CurrentUser('id') userId: string) {
        return this.userService.getProfile(userId)
    }

    // HISTORIAL DE ORDENES CON SUS ITEMS Y RELACIONES
    @Get('OrderHistory')
    getOrderHistory(@CurrentUser('id') userId: string){
        return this.userService.getOrderHistory(userId)
    }
    
    // EDITAR PERFIL DEL USUARIO
    @Patch('updateProfile')
    updateProfile(@CurrentUser('id') userId: string, @Body() data: UpdateProfileDto) {
        return this.userService.updateProfile(userId, data)
    }
    // CAMBIAR PASS
    @Patch('changePass')
    changePassword(@CurrentUser('id') userId: string, @Body() data: ChangePasswordDto){
        return this.userService.changePassword(userId, data.currentPass, data.newPass)
    }

}
