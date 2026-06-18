import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  modules: defineTable({
    orgId: v.string(),
    moduleId: v.string(), // slug (e.g., "vajcia", "zemiaky")
    label: v.string(), // UI name
    unit: v.string(), // measurement unit (e.g., "ks", "kg")
    icon: v.string(), // Feather / Lucide icon name
    color: v.string(), // CSS variable token
  }).index("by_orgId_moduleId", ["orgId", "moduleId"]),

  entries: defineTable({
    orgId: v.string(),
    moduleId: v.string(),
    date: v.string(), // YYYY-MM-DD
    value: v.number(),
    note: v.optional(v.string()),
    loggedBy: v.string(), // Clerk user ID
    updatedAt: v.optional(v.number()),
  }).index("by_orgId_moduleId_date", ["orgId", "moduleId", "date"]),

  chickens: defineTable({
    orgId: v.string(),
    name: v.string(),
    count: v.number(),
    color: v.string(),
    notes: v.optional(v.string()),
    storageId: v.optional(v.string()), // Convex storage ID for custom photo
    presetId: v.optional(v.string()),  // Preset ID if standard breed
    hatchedDate: v.optional(v.string()), // YYYY-MM-DD
  }).index("by_orgId", ["orgId"]),
});
