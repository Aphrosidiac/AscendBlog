import { prisma } from './db'
import type { NotificationType } from '@/generated/prisma/enums'

/**
 * Collapses repeat events: a second clap from the same reader on the same story
 * refreshes the existing unread row instead of stacking another notification.
 */
export async function notify(input: {
  userId: string
  actorId: string
  type: NotificationType
  postId?: string
  responseId?: string
}) {
  if (input.userId === input.actorId) return
  const existing = await prisma.notification.findFirst({
    where: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId ?? null,
      responseId: input.responseId ?? null,
      read: false,
    },
    select: { id: true },
  })
  if (existing) {
    await prisma.notification.update({ where: { id: existing.id }, data: { createdAt: new Date() } })
    return
  }
  await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId,
      responseId: input.responseId,
    },
  })
}
