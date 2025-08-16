import { ApiError } from "@/app/lib/api-response";
import { Tower, TowerFilters } from "../domain/entities/tower.entity";
import { TowerRepository } from "../domain/models/tower.repository";

const towers: Tower[] = [
  {
    id: 1,
    nombre: 'Torre Norte Premium',
    numero: 'T001',
    descripcion: 'Torre principal con vista al norte de la ciudad, acabados de lujo y amplios espacios comunes.',
    direccion: 'Avenida Principal 123, Zona Norte',
    pisos: 25,
    apartamentosPorPiso: 4,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Torre Sur Residencial',
    numero: 'T002',
    descripcion: 'Torre residencial familiar con áreas verdes y zona de juegos infantiles.',
    direccion: 'Calle Secundaria 456, Zona Sur',
    pisos: 15,
    apartamentosPorPiso: 6,
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 3,
    nombre: 'Torre Executive',
    numero: 'T003',
    descripcion: 'Torre ejecutiva con oficinas y apartamentos de alta gama, ubicación estratégica.',
    direccion: 'Boulevard Central 789, Centro Empresarial',
    pisos: 30,
    apartamentosPorPiso: 2,
    createdAt: '2024-01-17T14:15:00Z',
    updatedAt: '2024-01-17T14:15:00Z'
  }
];

export class MemoryTowerRepository implements TowerRepository {
  async getAll(filters: TowerFilters) {
    let filtered = towers;
    
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.nombre.toLowerCase().includes(term) ||
        t.descripcion.toLowerCase().includes(term) ||
        t.direccion.toLowerCase().includes(term)
      );
    }
    
    if (filters.numero) {
      filtered = filtered.filter(t => t.numero === filters.numero);
    }

    const total = filtered.length;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return { data: filtered.slice(start, end), total };
  }

  async getById(id: number): Promise<Tower | null> {
    return towers.find(t => t.id === id) || null;
  }

  async create(towerData: Omit<Tower, "id" | "createdAt" | "updatedAt">): Promise<Tower> {
    if (towers.some(t => t.numero === towerData.numero)) {
      throw new ApiError("Número de torre duplicado", 400);
    }

    const newTower: Tower = {
      ...towerData,
      id: Math.max(...towers.map(t => t.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    towers.push(newTower);
    return newTower;
  }

  async update(id: number, updateData: Partial<Omit<Tower, "id" | "createdAt" | "updatedAt">>): Promise<Tower | null> {
    const index = towers.findIndex(t => t.id === id);
    if (index === -1) {
      return null;
    }

    if (updateData.numero && towers.some(t => t.numero === updateData.numero && t.id !== id)) {
      throw new ApiError("Número de torre duplicado", 400);
    }

    towers[index] = {
      ...towers[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return towers[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = towers.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }

    towers.splice(index, 1);
    return true;
  }
}