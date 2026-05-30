import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '@models/user.models';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
