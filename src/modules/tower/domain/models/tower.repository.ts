import { Tower, TowerFilters } from "../entities/tower.entity";

export interface TowerRepository {
  getAll(filters: TowerFilters): Promise<{ data: Tower[]; total: number }>;
  getById(id: number): Promise<Tower | null>;
  create(tower: Omit<Tower, "id" | "createdAt" | "updatedAt">): Promise<Tower>;
  update(id: number, tower: Partial<Omit<Tower, "id" | "createdAt" | "updatedAt">>): Promise<Tower | null>;
  delete(id: number): Promise<boolean>;
}