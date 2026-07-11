import { IsEnum } from 'class-validator';
import { UserRole } from '../../../enum/index';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
