import { TowerRepository } from "../domain/models/tower.repository";
import { ApiError } from "@/app/lib/api-response";

export class GetTowerById {
    constructor(private repo: TowerRepository) { }
    
    async execute(id: number) {
        const tower = await this.repo.getById(id);
        if (!tower) {
            throw new ApiError(`Torre con ID ${id} no encontrada`, 404);
        }
        return tower;
    }
}