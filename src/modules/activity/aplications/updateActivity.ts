import { ApiError } from "@/app/lib/api-response";
import { ActivityRepository } from "../domain/models/activity.repository";
import { UpdateActivityRequest, Activity } from "../domain/entities/activity.entity";

export class UpdateActivity {
    constructor(private activityRepository: ActivityRepository) {}

    async execute(id: number, request: UpdateActivityRequest): Promise<Activity> {
        const activity = await this.activityRepository.update(id, request);
        
        if (!activity) {
            throw new ApiError("Actividad no encontrada", 404);
        }
        
        return activity;
    }
}