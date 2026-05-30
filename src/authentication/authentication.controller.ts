import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { AuthenticationResponseDto } from './dto/authentication-response.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  async create(
    @Body() createAuthenticationDto: CreateAuthenticationDto,
  ): Promise<AuthenticationResponseDto> {
    const user = await this.authenticationService.create(
      createAuthenticationDto,
    );
    return this.mapToResponseDto(user);
  }

  @Get()
  async findAll(): Promise<AuthenticationResponseDto[]> {
    const users = await this.authenticationService.findAll();
    return users.map((user) => this.mapToResponseDto(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuthenticationResponseDto> {
    const user = await this.authenticationService.findOne(id);
    return this.mapToResponseDto(user);
  }

  @Patch(':id')
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
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(id);
  }

  private mapToResponseDto(user: any): AuthenticationResponseDto {
    const { password, ...responseDto } = user;
    return responseDto;
  }
}
