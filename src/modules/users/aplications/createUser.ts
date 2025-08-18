import { CreateUserRequest } from "../domain/entities/user.entity";
import { UserRepository } from "../domain/models/user.repository";

export class CreateUser {
    constructor(private repo: UserRepository) { }
    
    async execute(userData: CreateUserRequest) {
        return this.repo.create(userData);
    }
}