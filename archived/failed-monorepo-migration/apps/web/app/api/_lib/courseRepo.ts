import { prisma } from '@cyberlabin/database';
export const courseAccessRepo = {
  hasActiveEnrollment: (userId:string, courseId:string) => prisma.enrollment.findFirst({ where:{ userId, courseId, status:'ACTIVE', deletedAt:null } }).then(Boolean),
  hasActiveBatchMembership: (userId:string, courseId:string, batchId:string) => prisma.batchStudent.findFirst({ where:{ userId, courseId, batchId, status:'ACTIVE' } }).then(Boolean),
  hasAssignedCoursePermission: async (userId:string, _courseId:string) => {
    const assignments = await prisma.userRole.findMany({ where:{ userId }, select:{ roleId:true } }).catch(()=>[]);
    if (!assignments.length) return false;
    const roles = await prisma.role.findMany({ where:{ id:{ in: assignments.map((a:any)=>a.roleId) } }, select:{ name:true } });
    return roles.some((role:any) => ['super_admin','admin','cli_admin','instructor','lab_creator'].includes(role.name));
  }
};
