import { UpdateTowerRequest } from "../domain/entities/tower.entity";
import { TowerRepository } from "../domain/models/tower.repository";
import { ApiError } from "@/app/lib/api-response";

export class UpdateTower {
    constructor(private repo: TowerRepository) { }
    
    async execute(id: number, updateData: UpdateTowerRequest) {
        const updatedTower = await this.repo.update(id, updateData);
        if (!updatedTower) {
            throw new ApiError(`Torre con ID ${id} no encontrada`, 404);
        }
        return updatedTower;
    }
}