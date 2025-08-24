import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Google Sheets settings for this user
  googleApiKey: varchar("google_api_key"),
  sheetId: varchar("sheet_id"),
  sheetName: varchar("sheet_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  design: text("design").notNull(),
  orderDate: date("order_date").notNull(),
  pickupDate: date("pickup_date").notNull(),
  flavor: text("flavor").notNull(),
  sheet: text("sheet").notNull(),
  size: text("size").notNull(),
  cream: text("cream").notNull(),
  requests: text("requests"),
  notes: text("notes"),
  orderChannel: text("order_channel").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Google Sheets row structure
export const googleSheetsRowSchema = z.object({
  이름: z.string(),
  디자인: z.string(),
  주문일자: z.string(),
  픽업일자: z.string(),
  맛선택: z.string(),
  시트: z.string(),
  사이즈: z.string(),
  크림: z.string(),
  요청사항: z.string().optional(),
  특이사항: z.string().optional(),
  주문경로: z.string(),
});

export type GoogleSheetsRow = z.infer<typeof googleSheetsRowSchema>;