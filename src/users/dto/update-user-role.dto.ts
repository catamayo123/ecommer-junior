import { IsEnum } from 'class-validator';
import { UserRole } from '../../../enum/index';

export class UpdateUserRoleDTO {
  @IsEnum(UserRole)
  role!: UserRole;
}
