import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalJwtAuthGuard } from './global-jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('GlobalJwtAuthGuard', () => {
  let guard: GlobalJwtAuthGuard;
  let reflector: Reflector;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new GlobalJwtAuthGuard(reflector);
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('allows public routes without JWT validation', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const jwtGuardSpy = jest.spyOn(JwtAuthGuard.prototype, 'canActivate');

    const result = guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(result).toBe(true);
    expect(jwtGuardSpy).not.toHaveBeenCalled();
  });

  it('delegates to JwtAuthGuard for protected routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const jwtGuardSpy = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(jwtGuardSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });
});
