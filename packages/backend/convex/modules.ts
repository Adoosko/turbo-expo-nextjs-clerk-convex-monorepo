import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrgId } from "./utils";

export interface TrackingModule {
  moduleId: string;
  label: string;
  unit: string;
  icon: string;
  color: string;
}

// These are default system modules that can be seeded into an organization
// or used directly as fallback if not stored in the database yet.
export const SYSTEM_MODULES: Record<string, TrackingModule> = {
  vajcia: {
    moduleId: "vajcia",
    label: "Vajcia",
    unit: "ks",
    icon: "circle", // Placeholder for egg icon
    color: "--accent-warm",
  },
};

export function getSystemModule(moduleId: string): TrackingModule | undefined {
  return SYSTEM_MODULES[moduleId];
}

export const list = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const jwtOrgId = getOrgId(identity);
    if (jwtOrgId !== args.orgId) {
      throw new Error(`Unauthorized to access this farm (JWT: ${jwtOrgId}, Args: ${args.orgId})`);
    }

    const dbModules = await ctx.db
      .query("modules")
      .withIndex("by_orgId_moduleId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (dbModules.length === 0) {
      // Return system modules from memory
      return Object.values(SYSTEM_MODULES);
    }

    return dbModules;
  },
});

export const seed = mutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const jwtOrgId = getOrgId(identity);
    if (jwtOrgId !== args.orgId) {
      throw new Error("Unauthorized to access this farm");
    }

    const existing = await ctx.db
      .query("modules")
      .withIndex("by_orgId_moduleId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (existing.length === 0) {
      for (const module of Object.values(SYSTEM_MODULES)) {
        await ctx.db.insert("modules", {
          orgId: args.orgId,
          moduleId: module.moduleId,
          label: module.label,
          unit: module.unit,
          icon: module.icon,
          color: module.color,
        });
      }
    }
  },
});

