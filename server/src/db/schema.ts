import { sql } from "drizzle-orm";
import { 
  text, 
  pgTable, 
  timestamp, 
  varchar, 
  primaryKey,
  uuid 
} from "drizzle-orm/pg-core";

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: varchar("userAddress", { length: 256 }).notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: varchar("userAddress", { length: 256 }).notNull().references(() => wallets.userAddress),
  sessionToken: varchar("sessionToken", { length: 256 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const chatSessions = pgTable("chatSessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: varchar("userAddress", { length: 256 }).notNull().references(() => wallets.userAddress),
  title: text("title").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const chatHistory = pgTable("chatHistory", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: varchar("userAddress", { length: 256 }).notNull().references(() => wallets.userAddress),
  sessionId: uuid("sessionId").references(() => chatSessions.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const credentials = pgTable('credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  value: text('value').notNull(),
  nodeId: text('node_id').notNull(),
  canvasId: text('canvas_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const canvases = pgTable('canvases', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  data: text('data').notNull(), // JSON stringified canvas data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
