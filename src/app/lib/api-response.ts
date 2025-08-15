// lib/api-response.ts
import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    total?: number;
    page?: number;
    limit?: number;
}

export class ApiError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
    }
}

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: error.status }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500 }
    );
}

export function createApiResponse<T>(
    data: T,
    message?: string,
    status: number = 200,
    pagination?: { total?: number; page?: number; limit?: number }
): NextResponse {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
        ...pagination
    };

    return NextResponse.json(response, { status });
}

export function createErrorResponse(
    error: string,
    status: number = 400
): NextResponse {
    return NextResponse.json(
        { success: false, error },
        { status }
    );
}