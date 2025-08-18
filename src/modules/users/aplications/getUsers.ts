import { UserFilters } from "../domain/entities/user.entity";
import { UserRepository } from "../domain/models/user.repository";

export class GetUsers {
    constructor(private repo: UserRepository) { }
    async execute(filters: UserFilters) {
        return this.repo.getAll(filters);
    }
}