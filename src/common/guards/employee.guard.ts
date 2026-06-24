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
export class EmployeeGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    const jwtResult = super.canActivate(context);
    if (jwtResult instanceof Promise) {
      return jwtResult.then(() => this.validateEmployee(context));
    }
    return this.validateEmployee(context);
  }

  private validateEmployee(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== UserRole.Employee) {
      throw new ForbiddenException('Only employee users can perform this action');
    }

    return true;
  }
}
