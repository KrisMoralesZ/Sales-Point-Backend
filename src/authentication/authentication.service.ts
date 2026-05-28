import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  async create(createAuthenticationDto: CreateAuthenticationDto): Promise<User> {
    return this.usersService.create(createAuthenticationDto);
  }

  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  async update(
    id: string,
    updateAuthenticationDto: UpdateAuthenticationDto,
  ): Promise<User> {
    return this.usersService.update(id, updateAuthenticationDto);
  }

  async remove(id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }
}

