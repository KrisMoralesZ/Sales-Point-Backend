import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '@users/entities/user.entity';
export class CreateAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: UserRole;
}
