import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SYSTEM_MODULES } from "./modules";
import { getOrgId } from "./utils";

export const upsert = mutation({
  args: {
    orgId: v.string(),
    moduleId: v.string(),
    date: v.string(), // YYYY-MM-DD
    value: v.number(),
    note: v.optional(v.string()),
    type: v.optional(v.string()), // "income" | "expense"
    reason: v.optional(v.string()), // "predaj" | "darovanie" | "spotreba" | "kazene"
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

    if (args.value < 0) {
      throw new Error("Value cannot be negative");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("Neplatný formát dátumu");
    }

    // Ensure module is registered/seeded in DB
    const existingModule = await ctx.db
      .query("modules")
      .withIndex("by_orgId_moduleId", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId)
      )
      .unique();

    if (!existingModule) {
      const systemMod = SYSTEM_MODULES[args.moduleId];
      if (!systemMod) {
        throw new Error(`Module ${args.moduleId} is not registered in SYSTEM_MODULES`);
      }
      await ctx.db.insert("modules", {
        orgId: args.orgId,
        moduleId: args.moduleId,
        label: systemMod.label,
        unit: systemMod.unit,
        icon: systemMod.icon,
        color: systemMod.color,
      });
    }

    const entryType = args.type || "income";

    // Check if entry for (orgId, moduleId, date, type) already exists
    const candidates = await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId).eq("date", args.date)
      )
      .collect();

    const existingEntry = candidates.find((e) => (e.type || "income") === entryType);

    const loggedBy = identity.subject; // Clerk userId

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        value: args.value,
        note: args.note,
        type: entryType,
        reason: args.reason,
        loggedBy,
        updatedAt: Date.now(),
      });
      return existingEntry._id;
    } else {
      const entryId = await ctx.db.insert("entries", {
        orgId: args.orgId,
        moduleId: args.moduleId,
        date: args.date,
        value: args.value,
        note: args.note,
        type: entryType,
        reason: args.reason,
        loggedBy,
      });
      return entryId;
    }
  },
});

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
      throw new Error("Unauthorized to access this farm");
    }

    return await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

export const getStockLevel = query({
  args: { orgId: v.string(), moduleId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const jwtOrgId = getOrgId(identity);
    if (jwtOrgId !== args.orgId) throw new Error("Unauthorized to access this farm");

    const entries = await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId)
      )
      .collect();

    const income = entries
      .filter((e) => !e.type || e.type === "income")
      .reduce((sum, e) => sum + e.value, 0);
    const expense = entries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.value, 0);

    return { stock: income - expense, totalIncome: income, totalExpense: expense };
  },
});

export const getDashboardData = query({
  args: {
    orgId: v.string(),
    moduleId: v.string(),
    today: v.string(), // Pass device's local YYYY-MM-DD date
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

    const todayCandidates = await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId).eq("date", args.today)
      )
      .collect();

    const todayIncomeEntry = todayCandidates.find((e) => !e.type || e.type === "income") || null;
    const todayExpenseEntry = todayCandidates.find((e) => e.type === "expense") || null;

    // Fetch last 30 entries for history/sparkline
    const recentEntries = await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId)
      )
      .order("desc")
      .take(30);

    const allModuleEntries = await ctx.db
      .query("entries")
      .withIndex("by_orgId_moduleId_date", (q) =>
        q.eq("orgId", args.orgId).eq("moduleId", args.moduleId)
      )
      .collect();

    const totalIncome = allModuleEntries
      .filter((e) => !e.type || e.type === "income")
      .reduce((sum, e) => sum + e.value, 0);
    const totalExpense = allModuleEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.value, 0);

    return {
      todayValue: todayIncomeEntry ? todayIncomeEntry.value : 0,
      todayEntry: todayIncomeEntry,
      todayExpenseEntry,
      todayExpense: todayExpenseEntry ? todayExpenseEntry.value : 0,
      recentEntries,
      stock: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
    };
  },
});

export const remove = mutation({
  args: {
    orgId: v.string(),
    id: v.id("entries"),
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

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.orgId !== args.orgId) {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.id);
  },
});
