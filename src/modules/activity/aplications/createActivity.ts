import { ActivityRepository } from "../domain/models/activity.repository";
import { CreateActivityRequest, Activity } from "../domain/entities/activity.entity";

export class CreateActivity {
    constructor(private activityRepository: ActivityRepository) {}

    async execute(request: CreateActivityRequest): Promise<Activity> {
        const activity: Activity = {
            id: 0, // Will be set by database
            ...request,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return await this.activityRepository.create(activity);
    }
}