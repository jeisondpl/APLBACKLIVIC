import { CreateTowerRequest } from "../domain/entities/tower.entity";
import { TowerRepository } from "../domain/models/tower.repository";

export class CreateTower {
    constructor(private repo: TowerRepository) { }
    
    async execute(towerData: CreateTowerRequest) {
        return this.repo.create(towerData);
    }
}