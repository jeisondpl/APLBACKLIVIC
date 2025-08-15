// src/modules/apartments/application/getApartments.ts

import { ApartmentFilters } from "../domain/entities/apartment.entity";
import { ApartmentRepository } from "../domain/models/apartment.repository";

export class GetApartments {
    constructor(private repo: ApartmentRepository) { }
    async execute(filters: ApartmentFilters) {
        return this.repo.findAll(filters);
    }
}