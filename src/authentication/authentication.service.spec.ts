import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with a valid role', () => {
    const createdUser = service.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secure-password',
      role: 'Admin',
    });

    expect(createdUser).toMatchObject({
      name: 'Alice',
      email: 'alice@example.com',
      role: 'Admin',
    });
    expect(createdUser.id).toBeDefined();
    expect(service.findAll()).toHaveLength(1);
  });

  it('should reject unsupported roles', () => {
    expect(() =>
      service.create({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'secure-password',
        role: 'Manager',
      }),
    ).toThrow(BadRequestException);
  });
});
