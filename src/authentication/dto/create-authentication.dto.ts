import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '@models/user.models';
export class CreateAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  role!: UserRole;
}
