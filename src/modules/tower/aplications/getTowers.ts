import { TowerFilters } from "../domain/entities/tower.entity";
import { TowerRepository } from "../domain/models/tower.repository";

export class GetTowers {
    constructor(private repo: TowerRepository) { }
    async execute(filters: TowerFilters) {
        return this.repo.getAll(filters);
    }
}