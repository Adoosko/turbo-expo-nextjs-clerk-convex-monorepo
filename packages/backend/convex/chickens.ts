import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrgId } from "./utils";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    count: v.number(),
    color: v.string(),
    notes: v.optional(v.string()),
    storageId: v.optional(v.string()),
    presetId: v.optional(v.string()),
    hatchedDate: v.optional(v.string()),
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

    if (args.count < 0) {
      throw new Error("Count cannot be negative");
    }

    return await ctx.db.insert("chickens", {
      orgId: args.orgId,
      name: args.name,
      count: args.count,
      color: args.color,
      notes: args.notes,
      storageId: args.storageId,
      presetId: args.presetId,
      hatchedDate: args.hatchedDate,
    });
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

    const chickens = await ctx.db
      .query("chickens")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    // Resolve storageIds to public URLs
    return await Promise.all(
      chickens.map(async (c) => {
        let imageUrl: string | null = null;
        if (c.storageId) {
          imageUrl = await ctx.storage.getUrl(c.storageId);
        }
        return {
          ...c,
          imageUrl,
        };
      })
    );
  },
});

export const remove = mutation({
  args: {
    orgId: v.string(),
    id: v.id("chickens"),
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

    const chicken = await ctx.db.get(args.id);
    if (!chicken || chicken.orgId !== args.orgId) {
      throw new Error("Chicken breed not found");
    }

    // Delete custom uploaded image from storage if present
    if (chicken.storageId) {
      try {
        await ctx.storage.delete(chicken.storageId);
      } catch (err) {
        console.error("Failed to delete chicken image from storage:", err);
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const updateCount = mutation({
  args: {
    orgId: v.string(),
    id: v.id("chickens"),
    count: v.number(),
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

    if (args.count < 0) {
      throw new Error("Count cannot be negative");
    }

    await ctx.db.patch(args.id, {
      count: args.count,
    });
  },
});

export const promoteChicks = mutation({
  args: {
    orgId: v.string(),
    chickensId: v.id("chickens"),
    targetPresetId: v.string(),
    targetName: v.string(),
    targetColor: v.string(),
    countToPromote: v.number(),
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

    const chicksEntry = await ctx.db.get(args.chickensId);
    if (!chicksEntry || chicksEntry.orgId !== args.orgId) {
      throw new Error("Chicks record not found");
    }

    if (args.countToPromote <= 0 || args.countToPromote > chicksEntry.count) {
      throw new Error("Invalid count to reassign");
    }

    // 1. Subtract count from chicks entry
    const remainingCount = chicksEntry.count - args.countToPromote;
    if (remainingCount === 0) {
      await ctx.db.delete(args.chickensId);
      if (chicksEntry.storageId) {
        try {
          await ctx.storage.delete(chicksEntry.storageId);
        } catch (err) {
          console.error("Failed to delete image storage:", err);
        }
      }
    } else {
      await ctx.db.patch(args.chickensId, {
        count: remainingCount,
      });
    }

    // 2. Add count to the target breed
    // Search for existing entry of this breed in organization
    const existingTarget = await ctx.db
      .query("chickens")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .filter((q) =>
        args.targetPresetId === "custom"
          ? q.eq(q.field("name"), args.targetName)
          : q.eq(q.field("presetId"), args.targetPresetId)
      )
      .first();

    if (existingTarget) {
      await ctx.db.patch(existingTarget._id, {
        count: existingTarget.count + args.countToPromote,
      });
    } else {
      await ctx.db.insert("chickens", {
        orgId: args.orgId,
        name: args.targetName,
        count: args.countToPromote,
        color: args.targetColor,
        presetId: args.targetPresetId === "custom" ? undefined : args.targetPresetId,
      });
    }
  },
});

