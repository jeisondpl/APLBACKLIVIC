import { TowerRepository } from "../domain/models/tower.repository";
import { ApiError } from "@/app/lib/api-response";

export class DeleteTower {
    constructor(private repo: TowerRepository) { }
    
    async execute(id: number) {
        const deleted = await this.repo.delete(id);
        if (!deleted) {
            throw new ApiError(`Torre con ID ${id} no encontrada`, 404);
        }
        return { id, deleted: true };
    }
}