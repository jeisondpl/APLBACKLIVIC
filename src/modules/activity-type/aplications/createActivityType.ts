import { ActivityTypeRepository } from "../domain/models/activity-type.repository";
import { CreateActivityTypeRequest, ActivityType } from "../domain/entities/activity-type.entity";

export class CreateActivityType {
    constructor(private activityTypeRepository: ActivityTypeRepository) {}

    async execute(request: CreateActivityTypeRequest): Promise<ActivityType> {
        const activityType: ActivityType = {
            id: 0, // Will be set by database
            ...request,
            activo: request.activo ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return await this.activityTypeRepository.create(activityType);
    }
}