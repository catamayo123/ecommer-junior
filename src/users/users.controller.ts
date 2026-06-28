import { Controller, Get, Param, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}
