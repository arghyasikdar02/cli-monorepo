import { assertCourseAccess } from '../../../../packages/auth-guards/src/courseAccess';

export async function getDocumentPageExample({ user, params, query, db, renderer, audit }: any) {
  const document = await db.protectedDocument.findUnique({ where: { id: params.id } });
  if (!document) return { status: 404, body: { error: { code: 'NOT_FOUND' } } };

  await assertCourseAccess({ userId: user.id, courseId: document.courseId, roleKeys: user.roles }, db.courseAccess);
  await db.pageToken.verify(query.token, { documentId: document.id, page: Number(params.page), userId: user.id });

  const image = await renderer.renderWatermarkedPage({ document, page: Number(params.page), user });
  await db.documentPageView.create({ data: { courseId: document.courseId, documentId: document.id, userId: user.id, pageNumber: Number(params.page) } });
  await audit.log({ actorUserId: user.id, courseId: document.courseId, action: 'document.page_view', entityId: document.id });
  return { status: 200, headers: { 'content-type': 'image/png', 'cache-control': 'no-store' }, body: image };
}
