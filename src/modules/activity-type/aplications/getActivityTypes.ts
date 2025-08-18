import { ActivityTypeRepository } from "../domain/models/activity-type.repository";
import { ActivityTypeFilters } from "../domain/entities/activity-type.entity";

export class GetActivityTypes {
    constructor(private activityTypeRepository: ActivityTypeRepository) {}

    async execute(filters: ActivityTypeFilters) {
        return await this.activityTypeRepository.findAll(filters);
    }
}