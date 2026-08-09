import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum/index';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDTO } from './DTO/update-user-role.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // guard a nivel de clase pq todos los metodos los tiene que hacer el admin
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('findAllUser')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('findUserById/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch('updateUser/:id')
  updateUserRole(@Param('id') id: string, @Body() updateUserDTO: UpdateUserRoleDTO) {
    return this.usersService.updateUser(id, updateUserDTO);
  }

  @Delete('removeUser/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}
