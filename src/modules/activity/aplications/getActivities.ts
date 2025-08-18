import { ActivityRepository } from "../domain/models/activity.repository";
import { ActivityFilters } from "../domain/entities/activity.entity";

export class GetActivities {
    constructor(private activityRepository: ActivityRepository) {}

    async execute(filters: ActivityFilters) {
        return await this.activityRepository.findAll(filters);
    }
}