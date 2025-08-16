import { ApartmentRepository } from "../domain/models/apartment.repository";
import { ApiError } from "@/app/lib/api-response";

export class GetApartmentById {
    constructor(private repo: ApartmentRepository) { }
    
    async execute(id: number) {
        const apartment = await this.repo.getById(id);
        if (!apartment) {
            throw new ApiError(`Apartamento con ID ${id} no encontrado`, 404);
        }
        return apartment;
    }
}