import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

export function Admin() {
  return UseGuards(AdminGuard);
}
