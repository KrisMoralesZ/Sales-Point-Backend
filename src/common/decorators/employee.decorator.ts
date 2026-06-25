import { UseGuards } from '@nestjs/common';
import { EmployeeGuard } from '../guards/employee.guard';

export function Employee() {
  return UseGuards(EmployeeGuard);
}
