export enum UserRole {
  Admin = 'Admin',
  Employee = 'Employee',
}
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
