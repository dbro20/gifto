import { eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export type CreateUserData = {
  clerkId: string;
  email: string;
  name?: string | null;
};

export type UpdateUserData = {
  email?: string;
  name?: string | null;
};

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData) {
  const result = await db
    .insert(users)
    .values({
      clerkId: data.clerkId,
      email: data.email,
      name: data.name ?? null,
    })
    .returning();

  return result[0];
}

/**
 * Update a user by their Clerk ID
 */
export async function updateUser(clerkId: string, data: UpdateUserData) {
  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a user by their Clerk ID
 */
export async function deleteUser(clerkId: string) {
  const result = await db
    .delete(users)
    .where(eq(users.clerkId, clerkId))
    .returning();

  return result[0] ?? null;
}

/**
 * Get an existing user by Clerk ID, or create a new one if they don't exist.
 * Useful for API routes that need to ensure a user exists.
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name?: string | null
) {
  const existingUser = await getUserByClerkId(clerkId);

  if (existingUser) {
    return existingUser;
  }

  return createUser({
    clerkId,
    email,
    name,
  });
}
