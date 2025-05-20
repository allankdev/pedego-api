import { IsOptional, IsEnum, IsBooleanString } from 'class-validator';
import { UserRole } from '../../user/enums/user-role.enum';

export class FilterUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  storeId?: number;
}