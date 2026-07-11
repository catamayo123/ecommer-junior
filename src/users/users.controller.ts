import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '../../enum/index';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN) // guard a nivel de clase pq todos los metodos los tiene que hacer el admin
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('find')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch(':id/role')
  updateUserRole(@Param('id') id: string, @Body() updateUserdto: UpdateUserRoleDto) {
    return this.usersService.updateUser(id, updateUserdto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}
