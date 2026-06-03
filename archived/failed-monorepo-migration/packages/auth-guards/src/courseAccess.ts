export type CourseAccessInput = {
  userId: string;
  courseId: string;
  batchId?: string | null;
  resourceOwnerUserId?: string | null;
  roleKeys: string[];
};

export type CourseAccessRepository = {
  hasActiveEnrollment(userId: string, courseId: string): Promise<boolean>;
  hasActiveBatchMembership(userId: string, courseId: string, batchId: string): Promise<boolean>;
  hasAssignedCoursePermission(userId: string, courseId: string): Promise<boolean>;
};

export class CourseAccessDeniedError extends Error {
  code = 'COURSE_ACCESS_DENIED';
}

export async function assertCourseAccess(input: CourseAccessInput, repo: CourseAccessRepository) {
  const isPlatformStaff = input.roleKeys.some((role) => ['super_admin', 'admin', 'cli_admin'].includes(role));
  if (isPlatformStaff) return;

  const isAssignedStaff = input.roleKeys.some((role) => ['instructor', 'lab_creator'].includes(role));
  if (isAssignedStaff && await repo.hasAssignedCoursePermission(input.userId, input.courseId)) return;

  const enrolled = await repo.hasActiveEnrollment(input.userId, input.courseId);
  if (!enrolled) throw new CourseAccessDeniedError('Active enrollment required');

  if (input.batchId) {
    const inBatch = await repo.hasActiveBatchMembership(input.userId, input.courseId, input.batchId);
    if (!inBatch) throw new CourseAccessDeniedError('Active batch membership required');
  }

  if (input.resourceOwnerUserId && input.resourceOwnerUserId !== input.userId) {
    throw new CourseAccessDeniedError('Resource owner mismatch');
  }
}
