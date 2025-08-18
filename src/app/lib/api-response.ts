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

    const headers = new Headers({
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    });

    if (error instanceof ApiError) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: error.status, headers }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers }
        );
    }

    return NextResponse.json(
        { success: false, error: 'Error interno del servidor' },
        { status: 500, headers }
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

    const headers = new Headers({
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    });

    return NextResponse.json(response, { status, headers });
}

export function createErrorResponse(
    error: string,
    status: number = 400
): NextResponse {
    const headers = new Headers({
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    });

    return NextResponse.json(
        { success: false, error },
        { status, headers }
    );
}