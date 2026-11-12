export const queryKeys = {
  ownProfile: () => ['getOwnProfile'] as const,
  searchStudents: (params?: Record<string, unknown>) => ['searchStudents', params ?? {}] as const,
  studentById: (studentId: string) => ['getStudentById', studentId] as const,
  studentReviews: (params?: Record<string, unknown>) => ['listStudentReviews', params ?? {}] as const,
  reviewRevisions: (params?: Record<string, unknown>) => ['listReviewRevisions', params ?? {}] as const,
  approvalQueueItems: (params?: Record<string, unknown>) => ['listApprovalQueueItems', params ?? {}] as const,
  departments: (params?: Record<string, unknown>) => ['listDepartments', params ?? {}] as const,
  programs: (params?: Record<string, unknown>) => ['listPrograms', params ?? {}] as const,
  auditLogs: (params?: Record<string, unknown>) => ['listAuditLogs', params ?? {}] as const,
  tags: (params?: Record<string, unknown>) => ['listTags', params ?? {}] as const,
  facultyProfiles: (params?: Record<string, unknown>) => ['listFaculty', params ?? {}] as const,
};


