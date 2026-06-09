import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  MinLength,
} from 'class-validator';
import { UserRole } from '@models/user.models';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
