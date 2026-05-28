export interface IUser {
  id: number | string;
  name: string;
  email: string;
  UserRole: 'Admin' | 'Employee';
  createdAt: Date;
  updatedAt: Date;
}
