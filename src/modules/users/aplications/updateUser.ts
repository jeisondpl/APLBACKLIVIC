import { UpdateUserRequest } from "../domain/entities/user.entity";
import { UserRepository } from "../domain/models/user.repository";
import { ApiError } from "@/app/lib/api-response";

export class UpdateUser {
    constructor(private repo: UserRepository) { }
    
    async execute(id: number, updateData: UpdateUserRequest) {
        const updatedUser = await this.repo.update(id, updateData);
        if (!updatedUser) {
            throw new ApiError(`Usuario con ID ${id} no encontrado`, 404);
        }
        return updatedUser;
    }
}