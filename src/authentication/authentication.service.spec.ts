import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@models/user.models';
import { AuthenticationService } from './authentication.service';

jest.mock('bcrypt');

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.Employee,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const createAuthenticationDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.create(createAuthenticationDto);

      expect(usersService.create).toHaveBeenCalledWith(createAuthenticationDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createAuthenticationDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Email already in use'),
      );

      await expect(service.create(createAuthenticationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when invalid role provided', async () => {
      const createAuthenticationDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'InvalidRole' as UserRole,
      };

      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Role must be either Admin or Employee'),
      );

      await expect(service.create(createAuthenticationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully and return user with token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({
        user: mockUser,
        token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should include user id in jwt payload', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
      );
    });

    it('should include email in jwt payload', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
        }),
      );
    });

    it('should include role in jwt payload', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          role: mockUser.role,
        }),
      );
    });

    it('should propagate jwt sign errors', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(service.login(loginDto)).rejects.toThrow('JWT error');
    });

    it('should throw if user lookup fails', async () => {
      mockUsersService.findByEmail.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: '2', email: 'jane@example.com' },
      ];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return an empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with id invalid-id not found'),
      );

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findByEmail.mockRejectedValue(
        new NotFoundException('User with email invalid@example.com not found'),
      );

      await expect(service.findByEmail('invalid@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user with valid data', async () => {
      const updateAuthenticationDto = {
        name: 'Jane Doe',
        role: UserRole.Admin,
      };
      const updatedUser = { ...mockUser, ...updateAuthenticationDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateAuthenticationDto);

      expect(usersService.update).toHaveBeenCalledWith(
        '1',
        updateAuthenticationDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should update password for user', async () => {
      const updateAuthenticationDto = {
        password: 'newPassword123',
      };
      const updatedUser = {
        ...mockUser,
        password: 'hashedNewPassword',
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateAuthenticationDto);

      expect(usersService.update).toHaveBeenCalledWith(
        '1',
        updateAuthenticationDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException when invalid role provided', async () => {
      const updateAuthenticationDto = {
        role: 'InvalidRole' as UserRole,
      };

      mockUsersService.update.mockRejectedValue(
        new BadRequestException('Role must be either Admin or Employee'),
      );

      await expect(
        service.update('1', updateAuthenticationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const updateAuthenticationDto = {
        email: 'existing@example.com',
      };

      mockUsersService.update.mockRejectedValue(
        new BadRequestException('Email already in use'),
      );

      await expect(
        service.update('1', updateAuthenticationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User with id invalid-id not found'),
      );

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User with id invalid-id not found'),
      );

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
