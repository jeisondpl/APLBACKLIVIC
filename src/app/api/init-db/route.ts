import { createApiResponse, handleApiError } from '@/app/lib/api-response';
import { createTables } from '@/lib/db';

export async function POST() {
    try {
        await createTables();
        return createApiResponse(null, "Database tables created successfully", 200);
    } catch (error) {
        return handleApiError(error);
    }
}