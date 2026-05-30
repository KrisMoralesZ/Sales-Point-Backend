import { UserRole } from '@models/user.models';

export class UserResponseDto {
  id!: string;

  name!: string;

  email!: string;

  role!: UserRole;

  createdAt!: Date;

  updatedAt!: Date;
}
