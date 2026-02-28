import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cars = pgTable("cars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  images: text("images").array().default(sql`'{}'`),
  seats: integer("seats").notNull(),
  transmission: text("transmission").notNull(),
  fuelType: text("fuel_type").notNull(),
  luggage: integer("luggage").notNull(),
  doors: integer("doors").notNull(),
  year: integer("year").notNull(),
  hasGPS: boolean("has_gps").notNull().default(false),
  hasBluetooth: boolean("has_bluetooth").notNull().default(false),
  hasAC: boolean("has_ac").notNull().default(true),
  hasUSB: boolean("has_usb").notNull().default(false),
  isComingSoon: boolean("is_coming_soon").notNull().default(false),
  isSold: boolean("is_sold").notNull().default(false),
  // Technical Specifications
  price: text("price"),
  kms: text("kms"),
  consumption: text("consumption"),
  engine: text("engine"),
  power: text("power"),
  drivetrain: text("drivetrain"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  // Frontend-managed characteristics moved to backend
  features: text("features").array().default(sql`'{}'`),
  enhancements: text("enhancements").array().default(sql`'{}'`),
  badges: text("badges").array().default(sql`'{}'`),
  timelineTitles: text("timeline_titles").array().default(sql`'{}'`),
  timelineDescs: text("timeline_descs").array().default(sql`'{}'`),
  // Verified Asset Dossier
  auctionGrade: text("auction_grade"),
  verifiedMileage: text("verified_mileage"),
  accidentHistory: text("accident_history"),
  dossierTitle: text("dossier_title"),
  dossierText: text("dossier_text"),
  published: boolean("published").notNull().default(true),
});

// Custom URL validator that accepts both full URLs and relative paths
const urlOrPath = z.string().refine(
  (val) => {
    if (!val || val.trim() === "") return true; // Allow empty strings
    // Check if it's a valid URL (http/https) or a valid relative path (starts with /)
    try {
      new URL(val);
      return true; // Valid absolute URL
    } catch {
      // Not a valid absolute URL, check if it's a valid relative path
      return val.startsWith("/") || val.startsWith("./") || val.startsWith("../");
    }
  },
  {
    message: "Must be a valid URL or relative path (starting with /)",
  }
);

// Create a custom schema that extends the generated one to properly handle images
export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  slug: true,
}).extend({
  name: z.string().min(1, "Car name is required"),
  image: urlOrPath,
  images: z.array(urlOrPath).optional().nullable().default([]),
  features: z.array(z.string()).optional().nullable().default([]),
  enhancements: z.array(z.string()).optional().nullable().default([]),
  badges: z.array(z.string()).optional().nullable().default([]),
  timelineTitles: z.array(z.string()).optional().nullable().default([]),
  timelineDescs: z.array(z.string()).optional().nullable().default([]),
  isComingSoon: z.boolean().optional().default(false),
  isSold: z.boolean().optional().default(false),
  price: z.string().optional().nullable(),
  kms: z.string().optional().nullable(),
  auctionGrade: z.string().optional().nullable(),
  verifiedMileage: z.string().optional().nullable(),
  accidentHistory: z.string().optional().nullable(),
  dossierTitle: z.string().optional().nullable(),
  dossierText: z.string().optional().nullable(),
  published: z.boolean().optional().default(true),
});

export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inquiry schema (rebranded from Bookings)
export const inquiryStatusSchema = z.enum([
  "pending",
  "contacted",
  "fulfilled",
  "cancelled",
]);

export const insertInquirySchema = z.object({
  carId: z.string().optional(), // Optional for "Find Me a Car"
  carName: z.string().optional(), // Optional for "Find Me a Car"
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  // "Find Me a Car" specific fields
  budget: z.string().optional(),
  modelPreference: z.string().optional(),
  yearRange: z.string().optional(),
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export const inquirySchema = insertInquirySchema.extend({
  id: z.string().min(1),
  status: inquiryStatusSchema.default("pending"),
  createdAt: z.string(),
});

export type Inquiry = z.infer<typeof inquirySchema>;
// Booking schema (for Inspection Bookings)
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carId: text("car_id"),
  carName: text("car_name"),
  inspectionDate: text("inspection_date").notNull(),
  inspectionTime: text("inspection_time").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
