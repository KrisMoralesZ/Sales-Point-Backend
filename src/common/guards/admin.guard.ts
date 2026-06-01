import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@models/user.models';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    // First, validate JWT token
    const jwtResult = super.canActivate(context);
    if (jwtResult instanceof Promise) {
      return jwtResult.then(() => this.validateAdmin(context));
    }
    return this.validateAdmin(context);
  }

  private validateAdmin(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== UserRole.Admin) {
      throw new ForbiddenException('Only admin users can perform this action');
    }

    return true;
  }
}
