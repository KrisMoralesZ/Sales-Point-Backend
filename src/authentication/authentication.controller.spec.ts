import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserRole } from '@models/user.models';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: UserRole.Admin,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUsers = [mockUser];

  const mockAuthenticationService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
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
    it('should create a new authentication record and return AuthenticationResponseDto', async () => {
      const createAuthDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Admin,
      };

      const result = await controller.create(createAuthDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(service.create).toHaveBeenCalledWith(createAuthDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should convert Date objects to ISO strings in response', async () => {
      const createAuthDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Admin,
      };

      const result = await controller.create(createAuthDto);

      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should return user without password field if password is excluded', async () => {
      const createAuthDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Admin,
      };

      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;
      mockAuthenticationService.create.mockResolvedValueOnce(
        userWithoutPassword,
      );

      const result = await controller.create(createAuthDto);

      expect(result.password).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all authentication records as AuthenticationResponseDto[]', async () => {
      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUser.id);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockAuthenticationService.findAll.mockResolvedValueOnce([]);

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
      mockAuthenticationService.findAll.mockResolvedValueOnce([
        mockUser,
        mockUser2,
      ]);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('findOne', () => {
    it('should return a single authentication record by id', async () => {
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
  });

  describe('update', () => {
    it('should update an authentication record and return updated AuthenticationResponseDto', async () => {
      const updateAuthDto = {
        name: 'Updated Name',
      };

      const result = await controller.update('1', updateAuthDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(service.update).toHaveBeenCalledWith('1', updateAuthDto);
    });

    it('should convert Date objects to ISO strings in response', async () => {
      const updateAuthDto = {
        name: 'Updated Name',
      };

      const result = await controller.update('1', updateAuthDto);

      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should pass correct parameters to service', async () => {
      const updateAuthDto = {
        email: 'newemail@example.com',
        role: UserRole.Employee,
      };

      await controller.update('1', updateAuthDto);

      expect(service.update).toHaveBeenCalledWith('1', updateAuthDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = {
        name: 'New Name',
      };

      await controller.update('1', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('1', partialUpdate);
    });
  });

  describe('remove', () => {
    it('should remove an authentication record by id', async () => {
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
      mockAuthenticationService.create.mockRejectedValueOnce(error);

      const createAuthDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.Admin,
      };

      await expect(controller.create(createAuthDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle service errors during findOne', async () => {
      const error = new Error('User not found');
      mockAuthenticationService.findOne.mockRejectedValueOnce(error);

      await expect(controller.findOne('999')).rejects.toThrow('User not found');
    });

    it('should handle service errors during update', async () => {
      const error = new Error('Update failed');
      mockAuthenticationService.update.mockRejectedValueOnce(error);

      await expect(
        controller.update('1', { name: 'New Name' }),
      ).rejects.toThrow('Update failed');
    });

    it('should handle service errors during remove', async () => {
      const error = new Error('Delete failed');
      mockAuthenticationService.remove.mockRejectedValueOnce(error);

      await expect(controller.remove('1')).rejects.toThrow('Delete failed');
    });
  });
});
