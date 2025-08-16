import { CreateApartmentRequest } from "../domain/entities/apartment.entity";
import { ApartmentRepository } from "../domain/models/apartment.repository";

export class CreateApartment {
    constructor(private repo: ApartmentRepository) { }
    
    async execute(apartmentData: CreateApartmentRequest) {
        const newApartment = {
            ...apartmentData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return this.repo.create(newApartment);
    }
}