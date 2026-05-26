import { AuthenticationRole } from '../entities/authentication.entity';

export class CreateAuthenticationDto {
  name: string;
  email: string;
  role: AuthenticationRole;
}
