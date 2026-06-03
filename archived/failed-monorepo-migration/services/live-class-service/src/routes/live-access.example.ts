import { assertCourseAccess } from '../../../../packages/auth-guards/src/courseAccess';

export async function joinLiveClassExample({ user, params, db, audit }: any) {
  const liveClass = await db.liveClass.findUnique({ where: { id: params.id } });
  if (!liveClass) return { status: 404, body: { error: { code: 'NOT_FOUND' } } };

  await assertCourseAccess({
    userId: user.id,
    courseId: liveClass.courseId,
    batchId: liveClass.batchId,
    roleKeys: user.roles,
  }, db.courseAccess);

  const now = new Date();
  const joinOpen = new Date(liveClass.scheduledStart.getTime() - liveClass.joinOpenMinutesBefore * 60_000);
  if (liveClass.status !== 'LIVE' && (now < joinOpen || now > liveClass.scheduledEnd)) {
    return { status: 409, body: { error: { code: 'LIVE_JOIN_WINDOW_CLOSED' } } };
  }

  await db.liveClassAttendance.upsertForJoin(liveClass, user);
  await audit.log({ actorUserId: user.id, courseId: liveClass.courseId, action: 'live.join', entityId: liveClass.id });
  return { status: 200, body: { embedUrl: liveClass.embedUrl, heartbeatSeconds: 30 } };
}
