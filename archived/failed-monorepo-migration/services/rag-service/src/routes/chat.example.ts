import { assertCourseAccess } from '../../../../packages/auth-guards/src/courseAccess';

export async function sendAiMessageExample({ user, params, body, db, ragProvider }: any) {
  const session = await db.aiChatSession.findUnique({ where: { id: params.id } });
  if (!session || session.userId !== user.id) return { status: 404, body: { error: { code: 'NOT_FOUND' } } };

  await assertCourseAccess({ userId: user.id, courseId: session.courseId, roleKeys: user.roles }, db.courseAccess);
  await db.aiUsage.assertWithinLimits(user.id, session.courseId);

  const chunks = await db.documentChunk.search({
    courseId: session.courseId,
    query: body.message,
    limit: 8,
  });

  if (chunks.length === 0) {
    return { status: 200, body: { answer: 'This is outside the available course material.', citations: [] } };
  }

  const answer = await ragProvider.answerCourseOnly({ question: body.message, chunks });
  await db.aiChatMessage.createManyForTurn({ session, user, question: body.message, answer });
  return { status: 200, body: answer };
}
