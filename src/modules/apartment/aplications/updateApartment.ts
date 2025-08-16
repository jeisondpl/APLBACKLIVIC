import { UpdateApartmentRequest } from "../domain/entities/apartment.entity";
import { ApartmentRepository } from "../domain/models/apartment.repository";
import { ApiError } from "@/app/lib/api-response";

export class UpdateApartment {
    constructor(private repo: ApartmentRepository) { }
    
    async execute(id: number, updateData: UpdateApartmentRequest) {
        const updatedApartment = await this.repo.update(id, updateData);
        if (!updatedApartment) {
            throw new ApiError(`Apartamento con ID ${id} no encontrado`, 404);
        }
        return updatedApartment;
    }
}