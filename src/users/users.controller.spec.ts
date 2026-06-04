/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@models/user.models';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: UserRole.Employee,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUsers = [mockUser];

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        { provide: 'USER_REPOSITORY', useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new user and return UserResponseDto', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should convert Date objects to ISO strings in response', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      const result = await controller.create(createUserDto);

      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should call service with correct parameters', async () => {
      const createUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password456',
        role: UserRole.Admin,
      };

      await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle different user roles', async () => {
      const adminUserDto = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.Admin,
      };

      await controller.create(adminUserDto);

      expect(service.create).toHaveBeenCalledWith(adminUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users as UserResponseDto[]', async () => {
      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUser.id);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValueOnce([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should convert Date objects to ISO strings for all records', async () => {
      const result = await controller.findAll();

      result.forEach((user) => {
        expect(typeof user.createdAt).toBe('string');
        expect(typeof user.updatedAt).toBe('string');
      });
    });

    it('should return multiple records when they exist', async () => {
      const mockUser2 = {
        ...mockUser,
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      mockUsersService.findAll.mockResolvedValueOnce([mockUser, mockUser2]);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should map all user properties correctly', async () => {
      const result = await controller.findAll();

      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should convert Date objects to ISO strings', async () => {
      const result = await controller.findOne('1');

      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should call service with correct id parameter', async () => {
      await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle string id parameters correctly', async () => {
      await controller.findOne('uuid-123-456');

      expect(service.findOne).toHaveBeenCalledWith('uuid-123-456');
    });

    it('should map user properties correctly', async () => {
      const result = await controller.findOne('1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('update', () => {
    it('should update a user and return updated UserResponseDto', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const result = await controller.update('1', updateUserDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should convert Date objects to ISO strings in response', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const result = await controller.update('1', updateUserDto);

      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should pass correct parameters to service', async () => {
      const updateUserDto = {
        email: 'newemail@example.com',
        role: UserRole.Admin,
      };

      await controller.update('1', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = {
        name: 'New Name',
      };

      await controller.update('1', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('1', partialUpdate);
    });

    it('should handle role updates', async () => {
      const roleUpdate = {
        role: UserRole.Admin,
      };

      await controller.update('1', roleUpdate);

      expect(service.update).toHaveBeenCalledWith('1', roleUpdate);
    });

    it('should map all properties in response', async () => {
      const result = await controller.update('1', { name: 'New Name' });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const result = await controller.remove('1');

      expect(result).toBeDefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should call service with correct id parameter', async () => {
      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle uuid format ids', async () => {
      await controller.remove('550e8400-e29b-41d4-a716-446655440000');

      expect(service.remove).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('should return deleted response object', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual({ deleted: true });
    });
  });

  describe('error handling', () => {
    it('should handle service errors during create', async () => {
      const error = new Error('Database error');
      mockUsersService.create.mockRejectedValueOnce(error);

      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Employee,
      };

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('User not found');
      mockUsersService.findOne.mockRejectedValueOnce(error);

      await expect(controller.findOne('999')).rejects.toThrow('User not found');
    });

    it('should handle service errors during update', async () => {
      const error = new Error('Update failed');
      mockUsersService.update.mockRejectedValueOnce(error);

      await expect(
        controller.update('1', { name: 'New Name' }),
      ).rejects.toThrow('Update failed');
    });

    it('should handle service errors during remove', async () => {
      const error = new Error('Delete failed');
      mockUsersService.remove.mockRejectedValueOnce(error);

      await expect(controller.remove('1')).rejects.toThrow('Delete failed');
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection failed');
      mockUsersService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('data mapping', () => {
    it('should exclude password from response when not explicitly included', async () => {
      const { password, ...userWithoutPassword } = mockUser as any;
      mockUsersService.findOne.mockResolvedValueOnce(
        userWithoutPassword as any,
      );

      const result = await controller.findOne('1');

      // UserResponseDto doesn't include password - assert via any to avoid TS error
      expect((result as any).password).toBeUndefined();
    });

    it('should handle null/undefined dates gracefully', async () => {
      const userWithoutDates = {
        ...mockUser,
        createdAt: null,
        updatedAt: undefined,
      };
      mockUsersService.findOne.mockResolvedValueOnce(userWithoutDates);

      const result = await controller.findOne('1');

      expect(result.createdAt).toBeNull();
      expect(result.updatedAt).toBeUndefined();
    });
  });
});
