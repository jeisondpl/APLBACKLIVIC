// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Tipos para mejor TypeScript
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

interface CreateUserRequest {
    name: string;
    email: string;
}

// Simulamos una "base de datos" en memoria
let users: User[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', createdAt: '2024-01-15' },
    { id: 2, name: 'María García', email: 'maria@email.com', createdAt: '2024-01-16' }
];

// GET /api/users
export async function GET(request: NextRequest) {
    try {
        // Parámetros de query
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const search = searchParams.get('search');

        let filteredUsers = users;

        // Filtrar por búsqueda
        if (search) {
            filteredUsers = users.filter(user =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Limitar resultados
        if (limit) {
            filteredUsers = filteredUsers.slice(0, parseInt(limit));
        }

        return NextResponse.json({
            success: true,
            data: filteredUsers,
            total: filteredUsers.length
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// POST /api/users
export async function POST(request: NextRequest) {
    try {
        const body: CreateUserRequest = await request.json();

        // Validación
        if (!body.name || !body.email) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Los campos name y email son requeridos'
                },
                { status: 400 }
            );
        }

        // Validar email único
        const existingUser = users.find(user => user.email === body.email);
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'El email ya está registrado'
                },
                { status: 409 }
            );
        }

        // Crear nuevo usuario
        const newUser: User = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            name: body.name,
            email: body.email,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        return NextResponse.json({
            success: true,
            data: newUser,
            message: 'Usuario creado exitosamente'
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al procesar la solicitud' },
            { status: 400 }
        );
    }
}

// PUT /api/users (actualizar múltiples)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        // Lógica para actualizar múltiples usuarios
        return NextResponse.json({
            success: true,
            message: 'Usuarios actualizados'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error en actualización' },
            { status: 400 }
        );
    }
}

// DELETE /api/users (eliminar múltiples)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids')?.split(',').map(id => parseInt(id));

        if (ids) {
            users = users.filter(user => !ids.includes(user.id));
        }

        return NextResponse.json({
            success: true,
            message: `${ids?.length || 0} usuarios eliminados`
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error en eliminación' },
            { status: 400 }
        );
    }
}