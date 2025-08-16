// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{ id: string }>; // En Next.js 15, params es una Promise
}

// Simulamos la misma base de datos
const users = [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', createdAt: '2024-01-15' },
    { id: 2, name: 'María García', email: 'maria@email.com', createdAt: '2024-01-16' }
];

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params; // Await params en Next.js 15
        const userId = parseInt(id);

        const user = users.find(u => u.id === userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });

    } catch {
        return NextResponse.json(
            { success: false, error: 'Error interno' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const userId = parseInt(id);
        const body = await request.json();

        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar usuario
        users[userIndex] = { ...users[userIndex], ...body };

        return NextResponse.json({
            success: true,
            data: users[userIndex],
            message: 'Usuario actualizado'
        });

    } catch {
        return NextResponse.json(
            { success: false, error: 'Error en actualización' },
            { status: 400 }
        );
    }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        return NextResponse.json({
            success: true,
            data: deletedUser,
            message: 'Usuario eliminado'
        });

    } catch {
        return NextResponse.json(
            { success: false, error: 'Error en eliminación' },
            { status: 500 }
        );
    }
}