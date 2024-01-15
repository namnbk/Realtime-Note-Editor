import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    // Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("");
    }
    // User id
    const userId = identity.subject;
    // Get document
    const existingDocument = await ctx.db.get(args.id);
    // Check if exist
    if (!existingDocument) {
      throw new Error("Not found");
    }
    // Check if match with user
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    // Recursive Archive
    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId),
        )
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });
        // recursive
        await recursiveArchive(child._id);
      }
    };
    // Archive
    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });
    recursiveArchive(args.id);
    // Return
    return document;
  },
});

export const getSideBar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    // Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("");
    }
    // User id
    const userId = identity.subject;
    // Documents result
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});

export const get = query({
  handler: async (ctx) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Retrieve
    const documents = await ctx.db.query("documents").collect();
    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
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
    });
    return document;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Identity
    const userId = identity.subject;
    // Fetch trash
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Identity
    const userId = identity.subject;
    // Get document
    const existingDocument = await ctx.db.get(args.id);
    // Check document
    if (!existingDocument) {
      throw new Error("Not found");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    // Recursive restore
    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId),
        )
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });
        await recursiveRestore(child._id);
      }
    };
    // Restore
    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };
    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }
    // Mututate in db
    const document = await ctx.db.patch(args.id, options);
    // recursive restore
    recursiveRestore(args.id);
    // Return
    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Identity
    const userId = identity.subject;
    // Check document
    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) {
      throw new Error("Not found");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    // Hard delete
    const document = await ctx.db.delete(args.id);
    return document;
  },
});
