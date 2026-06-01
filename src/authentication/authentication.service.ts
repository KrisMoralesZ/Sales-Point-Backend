import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createAuthenticationDto: CreateAuthenticationDto,
  ): Promise<User> {
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

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
