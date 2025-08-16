import { ApartmentRepository } from "../domain/models/apartment.repository";
import { ApiError } from "@/app/lib/api-response";

export class DeleteApartment {
    constructor(private repo: ApartmentRepository) { }
    
    async execute(id: number) {
        const deleted = await this.repo.delete(id);
        if (!deleted) {
            throw new ApiError(`Apartamento con ID ${id} no encontrado`, 404);
        }
        return { id, deleted: true };
    }
}