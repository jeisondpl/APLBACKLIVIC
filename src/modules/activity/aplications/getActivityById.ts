import { ApiError } from "@/app/lib/api-response";
import { ActivityRepository } from "../domain/models/activity.repository";

export class GetActivityById {
    constructor(private activityRepository: ActivityRepository) {}

    async execute(id: number) {
        const activity = await this.activityRepository.getById(id);
        
        if (!activity) {
            throw new ApiError("Actividad no encontrada", 404);
        }
        
        return activity;
    }
}