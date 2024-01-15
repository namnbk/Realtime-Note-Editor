import {v} from 'convex/values';
import {mutation, query} from './_generated/server'
import {Doc, Id} from './_generated/dataModel';

export const getSideBar = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    // Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("")
    }
    // User id
    const userId = identity.subject;
    // Documents result
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => q
        .eq("userId", userId)
        .eq("parentDocument", args.parentDocument))
      .filter((q) =>
        q.eq(q.field("isArchived"), false)
      )
      .order("desc")
      .collect();
    return documents;
  }
})

export const get = query({
  handler: async (ctx) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated")
    }
    // Retrieve
    const documents = await ctx.db.query("documents").collect();
    return documents;
  }
})

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated")
    }
    // Identity
    const userId = identity.subject;
    // Create doc
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    })
    return document;
  }
})