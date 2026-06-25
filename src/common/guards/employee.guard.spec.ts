import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@models/user.models';
import { EmployeeGuard } from './employee.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../../users/entities/user.entity';

describe('EmployeeGuard', () => {
  let guard: EmployeeGuard;

  beforeEach(() => {
    guard = new EmployeeGuard();
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createContext(user?: Partial<User>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  }

  it('allows employee users', async () => {
    await expect(
      guard.canActivate(createContext({ role: UserRole.Employee })),
    ).resolves.toBe(true);
  });

  it('rejects admin users', async () => {
    await expect(
      guard.canActivate(createContext({ role: UserRole.Admin })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects unauthenticated users', async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
