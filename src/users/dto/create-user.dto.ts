import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  MinLength,
} from 'class-validator';
import { UserRole } from '@models/user.models';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'john@email.com' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({ example: 'secret123!' })
  password!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({ enum: UserRole, example: UserRole.Admin })
  role!: UserRole;
}
