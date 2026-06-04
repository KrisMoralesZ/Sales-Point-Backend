import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from '@models/user.models';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.Employee,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      (repository.create as jest.Mock).mockReturnValue(mockUser);
      (repository.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(repository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: UserRole.Employee,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when name is missing', async () => {
      const createUserDto = {
        name: '',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when email is missing', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: '',
        password: 'password123',
        role: UserRole.Employee,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when password is missing', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
        role: UserRole.Employee,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when role is invalid', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'InvalidRole' as any,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: '2', email: 'jane@example.com' },
      ];
      (repository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return an empty array when no users exist', async () => {
      (repository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findByEmail('invalid@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user with valid data', async () => {
      const updateUserDto = {
        name: 'Jane Doe',
        role: UserRole.Admin,
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (repository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      const updateUserDto = {
        password: 'newPassword123',
      };
      const updatedUser = { ...mockUser, password: 'hashedNewPassword' };

      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      (repository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException when role is invalid', async () => {
      const updateUserDto = {
        role: 'InvalidRole' as any,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      const updateUserDto = {
        email: 'existing@example.com',
      };
      const existingUser = { ...mockUser, email: 'existing@example.com' };

      (repository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (repository.remove as jest.Mock).mockResolvedValue(undefined);

      await service.remove('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
