export type AuthenticationRole = 'Admin' | 'Employe';

export class Authentication {
  id: string;
  name: string;
  email: string;
  role: AuthenticationRole;
  createdAt: string;
  updatedAt: string;
}
