import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { Authentication } from './entities/authentication.entity';

@Injectable()
export class AuthenticationService {
  private readonly users: Authentication[] = [];

  create(createAuthenticationDto: CreateAuthenticationDto): Authentication {
    const role = createAuthenticationDto.role;

    if (!this.isValidRole(role)) {
      throw new BadRequestException('Role must be either Admin or Employe');
    }

    if (!createAuthenticationDto.name || !createAuthenticationDto.email) {
      throw new BadRequestException('Name and email are required');
    }

    const newUser: Authentication = {
      id: randomUUID(),
      name: createAuthenticationDto.name,
      email: createAuthenticationDto.email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    return newUser;
  }

  findAll(): Authentication[] {
    return [...this.users];
  }

  findOne(id: string | number): Authentication {
    const user = this.users.find((item) => item.id === String(id));

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  update(
    id: string | number,
    updateAuthenticationDto: UpdateAuthenticationDto,
  ): Authentication {
    const user = this.findOne(id);

    if (
      updateAuthenticationDto.role &&
      !this.isValidRole(updateAuthenticationDto.role)
    ) {
      throw new BadRequestException('Role must be either Admin or Employe');
    }

    if (updateAuthenticationDto.name) {
      user.name = updateAuthenticationDto.name;
    }

    if (updateAuthenticationDto.email) {
      user.email = updateAuthenticationDto.email;
    }

    if (updateAuthenticationDto.role) {
      user.role = updateAuthenticationDto.role;
    }

    user.updatedAt = new Date().toISOString();

    return user;
  }

  remove(id: string | number): Authentication {
    const user = this.findOne(id);
    const index = this.users.findIndex((item) => item.id === String(id));

    this.users.splice(index, 1);

    return user;
  }

  private isValidRole(role: string): role is Authentication['role'] {
    return role === 'Admin' || role === 'Employe';
  }
}
