import { UserRole } from '@models/user.models';
export class Authentication {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  role!: UserRole;
  createdAt!: string;
  updatedAt!: string;
}
