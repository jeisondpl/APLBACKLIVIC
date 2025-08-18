import { UserRepository } from "../domain/models/user.repository";
import { ApiError } from "@/app/lib/api-response";

export class GetUserById {
    constructor(private repo: UserRepository) { }
    
    async execute(id: number) {
        const user = await this.repo.getById(id);
        if (!user) {
            throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        return user;
    }
}