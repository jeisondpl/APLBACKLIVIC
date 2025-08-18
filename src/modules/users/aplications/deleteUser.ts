import { UserRepository } from "../domain/models/user.repository";
import { ApiError } from "@/app/lib/api-response";

export class DeleteUser {
    constructor(private repo: UserRepository) { }
    
    async execute(id: number) {
        const deleted = await this.repo.delete(id);
        if (!deleted) {
            throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        return { id, deleted: true };
    }
}