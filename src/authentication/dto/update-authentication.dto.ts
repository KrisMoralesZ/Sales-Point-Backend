import { CreateAuthenticationDto } from './create-authentication.dto';

export class UpdateAuthenticationDto implements Partial<CreateAuthenticationDto> {
  name?: string;
  email?: string;
  role?: CreateAuthenticationDto['role'];
}
