import { ApiError } from "@/app/lib/api-response";
import { ActivityTypeRepository } from "../domain/models/activity-type.repository";

export class GetActivityTypeById {
    constructor(private activityTypeRepository: ActivityTypeRepository) {}

    async execute(id: number) {
        const activityType = await this.activityTypeRepository.getById(id);
        
        if (!activityType) {
            throw new ApiError("Tipo de actividad no encontrado", 404);
        }
        
        return activityType;
    }
}