// Simple approach: always use local client for now, fix Vercel later
export { sql } from './db-local';

export async function createTables() {
  // Delegate to the db-local implementation which has the updated schema
  const { createTables: createTablesLocal } = await import('./db-local');
  return createTablesLocal();
}

export async function updateTimestamp(table: string, id: number) {
  // Delegate to the db-local implementation
  const { updateTimestamp: updateTimestampLocal } = await import('./db-local');
  return updateTimestampLocal(table, id);
}