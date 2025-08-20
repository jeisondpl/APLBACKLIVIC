'use client';

import { useState } from 'react';

interface EndpointInfo {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    location: 'path' | 'query' | 'body';
  }>;
  response: {
    success: any;
    error?: any;
  };
}

const endpoints: EndpointInfo[] = [
  // BOOKINGS
  {
    method: 'GET',
    path: '/api/bookings',
    description: 'Obtiene todas las reservas con filtros opcionales',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por texto', required: false, location: 'query' },
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: false, location: 'query' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'query' },
      { name: 'usuarioId', type: 'number', description: 'ID del usuario', required: false, location: 'query' },
      { name: 'estado', type: 'string', description: 'Estado: pending, confirmed, cancelled, completed', required: false, location: 'query' },
      { name: 'fechaCheckInDesde', type: 'string', description: 'Fecha desde (YYYY-MM-DD)', required: false, location: 'query' },
      { name: 'fechaCheckInHasta', type: 'string', description: 'Fecha hasta (YYYY-MM-DD)', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados (máx 100)', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: {
        success: true,
        data: "Array<BookingApartment>",
        total: "number",
        page: "number",
        limit: "number"
      }
    }
  },
  {
    method: 'POST',
    path: '/api/bookings',
    description: 'Crea una nueva reserva, opcionalmente con actividad asociada',
    parameters: [
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: true, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: true, location: 'body' },
      { name: 'usuarioId', type: 'number', description: 'ID del usuario', required: true, location: 'body' },
      { name: 'fechaCheckIn', type: 'string', description: 'Fecha de check-in (YYYY-MM-DD)', required: true, location: 'body' },
      { name: 'fechaCheckOut', type: 'string', description: 'Fecha de check-out (YYYY-MM-DD)', required: true, location: 'body' },
      { name: 'estado', type: 'string', description: 'Estado de la reserva', required: false, location: 'body' },
      { name: 'observaciones', type: 'string', description: 'Observaciones adicionales', required: false, location: 'body' },
      { name: 'createActivity', type: 'boolean', description: 'Crear actividad automática', required: false, location: 'body' },
      { name: 'activityData', type: 'object', description: 'Datos de la actividad a crear', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "BookingApartment", message: "string" },
      error: { success: false, error: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/bookings/[id]',
    description: 'Obtiene una reserva específica por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la reserva', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "BookingApartment" },
      error: { success: false, error: "Reserva no encontrada" }
    }
  },
  {
    method: 'PUT',
    path: '/api/bookings/[id]',
    description: 'Actualiza una reserva existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la reserva', required: true, location: 'path' },
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: false, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'body' },
      { name: 'usuarioId', type: 'number', description: 'ID del usuario', required: false, location: 'body' },
      { name: 'fechaCheckIn', type: 'string', description: 'Fecha de check-in', required: false, location: 'body' },
      { name: 'fechaCheckOut', type: 'string', description: 'Fecha de check-out', required: false, location: 'body' },
      { name: 'estado', type: 'string', description: 'Estado de la reserva', required: false, location: 'body' },
      { name: 'observaciones', type: 'string', description: 'Observaciones', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "BookingApartment", message: "string" },
      error: { success: false, error: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/bookings/[id]',
    description: 'Elimina una reserva',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la reserva', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Reserva eliminada exitosamente" },
      error: { success: false, error: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/bookings/availability',
    description: 'Verifica disponibilidad de un apartamento en fechas específicas',
    parameters: [
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: true, location: 'query' },
      { name: 'fechaCheckIn', type: 'string', description: 'Fecha de check-in', required: true, location: 'query' },
      { name: 'fechaCheckOut', type: 'string', description: 'Fecha de check-out', required: true, location: 'query' },
      { name: 'excludeBookingId', type: 'number', description: 'ID de reserva a excluir', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: { available: "boolean" } }
    }
  },

  // TOWERS
  {
    method: 'GET',
    path: '/api/towers',
    description: 'Obtiene todas las torres con filtros opcionales',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por nombre o número', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: "Array<Tower>", total: "number" }
    }
  },
  {
    method: 'POST',
    path: '/api/towers',
    description: 'Crea una nueva torre',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre de la torre', required: true, location: 'body' },
      { name: 'numero', type: 'string', description: 'Número único de la torre', required: true, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción de la torre', required: true, location: 'body' },
      { name: 'direccion', type: 'string', description: 'Dirección física', required: true, location: 'body' },
      { name: 'pisos', type: 'number', description: 'Número de pisos', required: true, location: 'body' },
      { name: 'apartamentos_por_piso', type: 'number', description: 'Apartamentos por piso', required: true, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Tower", message: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/towers/[id]',
    description: 'Obtiene una torre específica por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la torre', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "Tower" },
      error: { success: false, error: "Torre no encontrada" }
    }
  },
  {
    method: 'PUT',
    path: '/api/towers/[id]',
    description: 'Actualiza una torre existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la torre', required: true, location: 'path' },
      { name: 'nombre', type: 'string', description: 'Nombre de la torre', required: false, location: 'body' },
      { name: 'numero', type: 'string', description: 'Número de la torre', required: false, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción', required: false, location: 'body' },
      { name: 'direccion', type: 'string', description: 'Dirección', required: false, location: 'body' },
      { name: 'pisos', type: 'number', description: 'Número de pisos', required: false, location: 'body' },
      { name: 'apartamentos_por_piso', type: 'number', description: 'Apartamentos por piso', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Tower", message: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/towers/[id]',
    description: 'Elimina una torre',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la torre', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Torre eliminada exitosamente" }
    }
  },

  // APARTMENTS
  {
    method: 'GET',
    path: '/api/apartments',
    description: 'Obtiene todos los apartamentos con filtros opcionales',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por nombre o número', required: false, location: 'query' },
      { name: 'torreId', type: 'number', description: 'Filtrar por torre', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: "Array<Apartment>", total: "number" }
    }
  },
  {
    method: 'POST',
    path: '/api/apartments',
    description: 'Crea un nuevo apartamento',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre del apartamento', required: true, location: 'body' },
      { name: 'numero', type: 'string', description: 'Número único del apartamento', required: true, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción del apartamento', required: true, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Apartment", message: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/apartments/[id]',
    description: 'Obtiene un apartamento específico por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del apartamento', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "Apartment" }
    }
  },
  {
    method: 'PUT',
    path: '/api/apartments/[id]',
    description: 'Actualiza un apartamento existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del apartamento', required: true, location: 'path' },
      { name: 'nombre', type: 'string', description: 'Nombre del apartamento', required: false, location: 'body' },
      { name: 'numero', type: 'string', description: 'Número del apartamento', required: false, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción', required: false, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Apartment", message: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/apartments/[id]',
    description: 'Elimina un apartamento',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del apartamento', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Apartamento eliminado exitosamente" }
    }
  },

  // USERS
  {
    method: 'GET',
    path: '/api/users',
    description: 'Obtiene todos los usuarios con filtros opcionales',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por nombre o email', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: "Array<User>", total: "number" }
    }
  },
  {
    method: 'POST',
    path: '/api/users',
    description: 'Crea un nuevo usuario',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre completo del usuario', required: true, location: 'body' },
      { name: 'email', type: 'string', description: 'Email único del usuario', required: true, location: 'body' },
      { name: 'edad', type: 'number', description: 'Edad del usuario', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "User", message: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/users/[id]',
    description: 'Obtiene un usuario específico por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del usuario', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "User" }
    }
  },
  {
    method: 'PUT',
    path: '/api/users/[id]',
    description: 'Actualiza un usuario existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del usuario', required: true, location: 'path' },
      { name: 'nombre', type: 'string', description: 'Nombre del usuario', required: false, location: 'body' },
      { name: 'email', type: 'string', description: 'Email del usuario', required: false, location: 'body' },
      { name: 'edad', type: 'number', description: 'Edad del usuario', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "User", message: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/users/[id]',
    description: 'Elimina un usuario',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del usuario', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Usuario eliminado exitosamente" }
    }
  },

  // ACTIVITIES
  {
    method: 'GET',
    path: '/api/activities',
    description: 'Obtiene todas las actividades con filtros opcionales',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por nombre o descripción', required: false, location: 'query' },
      { name: 'tipoId', type: 'number', description: 'Filtrar por tipo de actividad', required: false, location: 'query' },
      { name: 'estado', type: 'string', description: 'Estado: PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA', required: false, location: 'query' },
      { name: 'apartamentoId', type: 'number', description: 'Filtrar por apartamento', required: false, location: 'query' },
      { name: 'torreId', type: 'number', description: 'Filtrar por torre', required: false, location: 'query' },
      { name: 'usuarioAsignadoId', type: 'number', description: 'Filtrar por usuario asignado', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: "Array<Activity>", total: "number" }
    }
  },
  {
    method: 'POST',
    path: '/api/activities',
    description: 'Crea una nueva actividad',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre de la actividad', required: true, location: 'body' },
      { name: 'tipoId', type: 'number', description: 'ID del tipo de actividad', required: true, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción de la actividad', required: false, location: 'body' },
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: false, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'body' },
      { name: 'usuarioAsignadoId', type: 'number', description: 'ID del usuario asignado', required: false, location: 'body' },
      { name: 'estado', type: 'string', description: 'Estado de la actividad', required: false, location: 'body' },
      { name: 'prioridad', type: 'string', description: 'Prioridad: BAJA, MEDIA, ALTA', required: false, location: 'body' },
      { name: 'fechaProgramada', type: 'string', description: 'Fecha programada (YYYY-MM-DD)', required: false, location: 'body' },
      { name: 'notas', type: 'string', description: 'Notas adicionales', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Activity", message: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/activities/[id]',
    description: 'Obtiene una actividad específica por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la actividad', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "Activity" }
    }
  },
  {
    method: 'PUT',
    path: '/api/activities/[id]',
    description: 'Actualiza una actividad existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la actividad', required: true, location: 'path' },
      { name: 'nombre', type: 'string', description: 'Nombre de la actividad', required: false, location: 'body' },
      { name: 'tipoId', type: 'number', description: 'ID del tipo de actividad', required: false, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción', required: false, location: 'body' },
      { name: 'apartamentoId', type: 'number', description: 'ID del apartamento', required: false, location: 'body' },
      { name: 'torreId', type: 'number', description: 'ID de la torre', required: false, location: 'body' },
      { name: 'usuarioAsignadoId', type: 'number', description: 'ID del usuario asignado', required: false, location: 'body' },
      { name: 'estado', type: 'string', description: 'Estado de la actividad', required: false, location: 'body' },
      { name: 'prioridad', type: 'string', description: 'Prioridad', required: false, location: 'body' },
      { name: 'fechaProgramada', type: 'string', description: 'Fecha programada', required: false, location: 'body' },
      { name: 'fechaCompletada', type: 'string', description: 'Fecha de completado', required: false, location: 'body' },
      { name: 'notas', type: 'string', description: 'Notas', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "Activity", message: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/activities/[id]',
    description: 'Elimina una actividad',
    parameters: [
      { name: 'id', type: 'number', description: 'ID de la actividad', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Actividad eliminada exitosamente" }
    }
  },

  // ACTIVITY TYPES
  {
    method: 'GET',
    path: '/api/activity-types',
    description: 'Obtiene todos los tipos de actividad',
    parameters: [
      { name: 'search', type: 'string', description: 'Búsqueda por nombre', required: false, location: 'query' },
      { name: 'activo', type: 'boolean', description: 'Filtrar por estado activo', required: false, location: 'query' },
      { name: 'limit', type: 'number', description: 'Límite de resultados', required: false, location: 'query' },
      { name: 'page', type: 'number', description: 'Página de resultados', required: false, location: 'query' }
    ],
    response: {
      success: { success: true, data: "Array<ActivityType>", total: "number" }
    }
  },
  {
    method: 'POST',
    path: '/api/activity-types',
    description: 'Crea un nuevo tipo de actividad',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre del tipo de actividad', required: true, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción del tipo', required: false, location: 'body' },
      { name: 'activo', type: 'boolean', description: 'Estado activo', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "ActivityType", message: "string" }
    }
  },
  {
    method: 'GET',
    path: '/api/activity-types/[id]',
    description: 'Obtiene un tipo de actividad específico por ID',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del tipo de actividad', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, data: "ActivityType" }
    }
  },
  {
    method: 'PUT',
    path: '/api/activity-types/[id]',
    description: 'Actualiza un tipo de actividad existente',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del tipo de actividad', required: true, location: 'path' },
      { name: 'nombre', type: 'string', description: 'Nombre del tipo', required: false, location: 'body' },
      { name: 'descripcion', type: 'string', description: 'Descripción', required: false, location: 'body' },
      { name: 'activo', type: 'boolean', description: 'Estado activo', required: false, location: 'body' }
    ],
    response: {
      success: { success: true, data: "ActivityType", message: "string" }
    }
  },
  {
    method: 'DELETE',
    path: '/api/activity-types/[id]',
    description: 'Elimina un tipo de actividad',
    parameters: [
      { name: 'id', type: 'number', description: 'ID del tipo de actividad', required: true, location: 'path' }
    ],
    response: {
      success: { success: true, message: "Tipo de actividad eliminado exitosamente" }
    }
  },

  // DATABASE INIT
  {
    method: 'POST',
    path: '/api/init-db',
    description: 'Inicializa la base de datos con tablas y datos de ejemplo',
    parameters: [],
    response: {
      success: { success: true, message: "Database tables created successfully" }
    }
  }
];

export default function Home() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointInfo | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const modules = [
    { key: 'all', label: 'Todos los módulos' },
    { key: 'bookings', label: 'Reservas' },
    { key: 'towers', label: 'Torres' },
    { key: 'apartments', label: 'Apartamentos' },
    { key: 'users', label: 'Usuarios' },
    { key: 'activities', label: 'Actividades' },
    { key: 'activity-types', label: 'Tipos de Actividad' },
    { key: 'init-db', label: 'Base de Datos' }
  ];

  const filteredEndpoints = selectedModule === 'all' 
    ? endpoints 
    : endpoints.filter(endpoint => endpoint.path.includes(`/api/${selectedModule}`));

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3002'
    : 'https://your-production-domain.com';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                LIVIC API Documentation
              </h1>
              <p className="mt-2 text-gray-600">
                Sistema de gestión inmobiliaria - Documentación de endpoints
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Base URL:</span>
              <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                {baseUrl}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Módulos</h2>
              
              {/* Module Filter */}
              <div className="mb-6">
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {modules.map(module => (
                    <option key={module.key} value={module.key}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint List */}
              <div className="space-y-2">
                {filteredEndpoints.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedEndpoint?.path === endpoint.path && selectedEndpoint?.method === endpoint.method
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-gray-700">
                      {endpoint.path}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {endpoint.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <div className="bg-white rounded-lg shadow">
                {/* Endpoint Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">
                      {selectedEndpoint.path}
                    </code>
                  </div>
                  <p className="text-gray-600">{selectedEndpoint.description}</p>
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ubicación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Requerido
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descripción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedEndpoint.parameters.map((param, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {param.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {param.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  param.location === 'path' ? 'bg-purple-100 text-purple-800' :
                                  param.location === 'query' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {param.location}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {param.required ? (
                                  <span className="text-red-600 font-medium">Sí</span>
                                ) : (
                                  <span className="text-gray-400">No</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {param.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Response Examples */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Respuestas</h3>
                  
                  <div className="space-y-4">
                    {/* Success Response */}
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">✅ Respuesta exitosa (200/201)</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code className="text-green-400 font-mono">{JSON.stringify(selectedEndpoint.response.success, null, 2)}</code>
                      </pre>
                    </div>

                    {/* Error Response */}
                    {selectedEndpoint.response.error && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">❌ Respuesta de error (400/404/409/500)</h4>
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code className="text-red-400 font-mono">{JSON.stringify(selectedEndpoint.response.error, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Try It Out */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Probar endpoint</h3>
                  <div className="bg-gray-900 p-4 rounded border">
                    <code className="text-yellow-400 font-mono text-sm">
                      curl -X {selectedEndpoint.method} "{baseUrl}{selectedEndpoint.path}" \\<br/>
                      &nbsp;&nbsp;-H "Content-Type: application/json"
                      {selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE' && (
                        <>\\<br/>&nbsp;&nbsp;-d '{JSON.stringify({}, null, 2)}'</>
                      )}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un endpoint
                </h3>
                <p className="text-gray-500">
                  Escoge un endpoint de la lista para ver su documentación detallada
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}