import { ApiError } from "@/app/lib/api-response";
import { ActivityTypeRepository } from "../domain/models/activity-type.repository";

export class DeleteActivityType {
    constructor(private activityTypeRepository: ActivityTypeRepository) {}

    async execute(id: number): Promise<boolean> {
        const deleted = await this.activityTypeRepository.delete(id);
        
        if (!deleted) {
            throw new ApiError("Tipo de actividad no encontrado", 404);
        }
        
        return deleted;
    }
}