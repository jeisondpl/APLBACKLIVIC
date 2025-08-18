import { ApiError } from "@/app/lib/api-response";
import { ActivityRepository } from "../domain/models/activity.repository";

export class DeleteActivity {
    constructor(private activityRepository: ActivityRepository) {}

    async execute(id: number): Promise<boolean> {
        const deleted = await this.activityRepository.delete(id);
        
        if (!deleted) {
            throw new ApiError("Actividad no encontrada", 404);
        }
        
        return deleted;
    }
}