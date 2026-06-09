import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticationResponseDto } from './dto/authentication-response.dto';
import { IUser } from '@models/user.models';
import { Public } from '../common/decorators/public.decorator';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateAuthenticationDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  async create(
    @Body() createAuthenticationDto: CreateAuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    const user = await this.authenticationService.create(
      createAuthenticationDto,
    );
    return this.mapToResponseDto(user);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<AuthenticationResponseDto & { token: string }> {
    const { user, token } = await this.authenticationService.login(loginDto);
    const responseDto = this.mapToResponseDto(user);
    return { ...responseDto, token };
  }

  @Get()
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully retrieved.',
  })
  async findAll(): Promise<AuthenticationResponseDto[]> {
    const users = await this.authenticationService.findAll();
    return users.map((user) => this.mapToResponseDto(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
  })
  async findOne(@Param('id') id: string): Promise<AuthenticationResponseDto> {
    const user = await this.authenticationService.findOne(id);
    return this.mapToResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAuthenticationDto: UpdateAuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    const user = await this.authenticationService.update(
      id,
      updateAuthenticationDto,
    );
    return this.mapToResponseDto(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(id);
  }

  private mapToResponseDto(
    user: IUser | Partial<IUser>,
  ): AuthenticationResponseDto {
    const { ...responseDto } = user;
    return {
      ...responseDto,
      createdAt:
        responseDto.createdAt instanceof Date
          ? responseDto.createdAt.toISOString()
          : responseDto.createdAt,
      updatedAt:
        responseDto.updatedAt instanceof Date
          ? responseDto.updatedAt.toISOString()
          : responseDto.updatedAt,
    } as AuthenticationResponseDto;
  }
}
