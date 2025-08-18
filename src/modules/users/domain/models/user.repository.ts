import { User, UserFilters } from "../entities/user.entity";

export interface UserRepository {
  getAll(filters: UserFilters): Promise<{ data: User[]; total: number }>;
  getById(id: number): Promise<User | null>;
  create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  update(id: number, user: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}