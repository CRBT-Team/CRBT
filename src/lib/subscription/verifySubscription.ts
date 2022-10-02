import { db } from "$lib/db";

export async function verifySubscription(userId: string): Promise<boolean> {
  const subscription = await db.subscription.findUnique({ where: { userId } })

  if (!subscription) return false;

  if (subscription.endsAt.getTime() < Date.now()) return false;

  if (!subscription.enabled) return false;

  return true;
}