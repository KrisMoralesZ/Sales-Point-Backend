import { UserRole } from '@models/user.models';

export class AuthenticationResponseDto {
  id!: string;

  name!: string;

  email!: string;

  role!: UserRole;

  createdAt!: string;

  updatedAt!: string;
}
