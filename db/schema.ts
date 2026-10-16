import { pgTable, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
export const pageContent = pgTable('page_content', {
  id: integer().primaryKey(),
  content: jsonb().notNull(),
  revision: integer().notNull().default(1),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
