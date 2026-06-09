import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'john@email.com' })
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'secret123!' })
  password!: string;
}
