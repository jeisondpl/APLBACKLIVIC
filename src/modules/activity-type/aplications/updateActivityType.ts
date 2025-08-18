import { ApiError } from "@/app/lib/api-response";
import { ActivityTypeRepository } from "../domain/models/activity-type.repository";
import { UpdateActivityTypeRequest, ActivityType } from "../domain/entities/activity-type.entity";

export class UpdateActivityType {
    constructor(private activityTypeRepository: ActivityTypeRepository) {}

    async execute(id: number, request: UpdateActivityTypeRequest): Promise<ActivityType> {
        const activityType = await this.activityTypeRepository.update(id, request);
        
        if (!activityType) {
            throw new ApiError("Tipo de actividad no encontrado", 404);
        }
        
        return activityType;
    }
}