import { sql } from "drizzle-orm";
import { 
  text, 
  pgTable, 
  timestamp, 
  varchar, 
  primaryKey,
  uuid ,
  boolean,
  integer,
  jsonb
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

type actionsType = 
    "chat_model"
    | "worker"
    | "supervisor"
    | "document_loader"
    | "embedding"
    | "graph"
    | "llm"
    | "memory"
    | "moderation"
    | "multi_agent"
    | "chain";
  
  


export type toolMetadata = {
  toolName: string
  toolInput: any
  nextToCall: string
  description: string
  callCount: number
  amount?: number
}


export const pipeFlow = pgTable('pipe_Flow', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid().references(() => wallets.id),
  title: varchar().notNull(),
  description: text()
})


export const pipe = pgTable('pipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  pipeFlowId: uuid().references(() => pipeFlow.id),
  name: text('name').notNull(),
  metadata: jsonb('metadata').$type<toolMetadata>(),
  multiRun: boolean('multi_run').default(false),
  currentCallCount: integer('current_call_count').default(0),
  maxCalls: integer('maxCalls').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})


