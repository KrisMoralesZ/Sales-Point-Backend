export enum UserRole {
  Admin = 'Admin',
  Employee = 'Employee',
}
export interface IUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
