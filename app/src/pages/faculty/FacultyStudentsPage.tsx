import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Badge,
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TablePaginationFooter,
  TableRow,
  TableRowSkeleton,
  TagCluster,
  useMinimumLoadingDuration,
} from '../../components/ui';
import { getTagBadgeVariant } from '../../components/reviews';
import { useSession } from '../../context/SessionContext';
import { useApprovedDepartmentOptions } from '../../hooks/useDepartments';
import { useStudentSearchPage, type StudentSearchResult } from '../../hooks/useSearchStudents';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { useTags } from '../../hooks/useTags';
import { FacultyStudentRegistration } from './FacultyStudentRegistration';
import './FacultyStudentsPage.css';

export function formatShortProgramName(program?: string | null): string {
  if (!program) return 'N/A';
  const trimmed = program.trim();
  if (!trimmed || trimmed.toLowerCase() === 'string') {
    return 'N/A';
  }
  return trimmed
    .replace(/^Bachelor of Science in\s+/i, 'BS ')
    .replace(/^Bachelor of Arts in\s+/i, 'BA ')
    .replace(/^BS in\s+/i, 'BS ')
    .replace(/^BA in\s+/i, 'BA ');
}

export function sanitizeVisibleReviewTags(tags?: string[] | null): string[] {
  if (!tags || tags.length === 0) return [];
  const filtered = tags
    .map((t) => t.trim())
    .filter((t) => Boolean(t) && t.toLowerCase() !== 'string');
  return filtered;
}

export function FacultyStudentsPage() {
  const { profile } = useSession();
  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: departments, isPending: isDepartmentsPending } = useApprovedDepartmentOptions({
    enabled: Boolean(isActiveFaculty),
  });
  const { data: tagsData, isPending: isTagsPending } = useTags(undefined, {
    enabled: Boolean(isActiveFaculty),
  });
  const { data: activeReviews } = useStudentReviews(
    { status: 'eq.active' },
    { enabled: Boolean(isActiveFaculty) }
  );

  const distinctTags = useMemo(() => {
    const list = (tagsData ?? [])
      .map((t) => t.tag.trim())
      .filter((t) => Boolean(t) && t.toLowerCase() !== 'string');
    return [...new Set(list)].sort((a, b) => a.localeCompare(b));
  }, [tagsData]);

  const facultyContributors = useMemo(() => {
    const map = new Map<string, string>();
    for (const review of activeReviews ?? []) {
      if (
        review.owner_id &&
        review.owner_id !== profile?.id &&
        review.author_name &&
        review.author_name.toLowerCase() !== 'string'
      ) {
        map.set(review.owner_id, review.author_name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeReviews, profile?.id]);

  const resolvedOwnerId = useMemo(() => {
    if (!selectedOwner) return undefined;
    if (selectedOwner === 'self') return profile?.id;
    return selectedOwner;
  }, [selectedOwner, profile?.id]);

  const searchParams = useMemo(() => {
    return {
      query: searchTerm.trim() || undefined,
      owner_department_id: selectedDepartment || undefined,
      tag: selectedTag || undefined,
      owner_id: resolvedOwnerId || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: 'created_at.desc,id.asc' as const,
    };
  }, [searchTerm, selectedDepartment, selectedTag, resolvedOwnerId, page, pageSize]);

  const {
    data: studentPage,
    isPending,
    isFetching,
    isError,
    error,
  } = useStudentSearchPage(searchParams, {
    enabled: Boolean(isActiveFaculty),
  });
  const isLoading = useMinimumLoadingDuration(isPending || isFetching);

  const students = studentPage?.students ?? [];
  const totalEntries = studentPage?.total ?? 0;

  useEffect(() => {
    if (!studentPage) return;
    const total = studentPage.total;
    const allowedSize = total < 10 ? 5 : total < 20 ? Math.min(pageSize, 10) : pageSize;
    if (allowedSize !== pageSize) {
      setPageSize(allowedSize);
      setPage(1);
    } else {
      const maxPage = Math.max(1, Math.ceil(total / pageSize));
      if (page > maxPage) {
        setPage(maxPage);
      }
    }
  }, [studentPage, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, page), totalPages);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedTag('');
    setSelectedOwner('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedDepartment || selectedTag || selectedOwner
  );

  if (!isActiveFaculty) {
    return (
      <AppShell
        role={profile?.role === 'admin' ? 'admin' : 'faculty'}
        activeNavKey="students"
        breadcrumb={
          profile?.role === 'admin' ? 'Admin Portal / Students' : 'Faculty Portal / Students'
        }
      >
        <div style={{ padding: '24px 0', maxWidth: '640px' }}>
          <div
            role="alert"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
            }}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
              Access Restricted
            </h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
              The student directory and review mining tools are reserved exclusively for active,
              verified faculty members. Pending accounts and administrative users are restricted
              from querying attributed student reviews.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="faculty" activeNavKey="students" breadcrumb="Faculty Portal / Students">
      <div className="faculty-students-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="header">
          <div>
            <h1 className="ui-heading-1">Students</h1>
            <p>Browse students and search the text of active reviews.</p>
          </div>
          <FacultyStudentRegistration />
        </div>

        <div className="controls-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#8A837A" strokeWidth="1.33" />
              <path
                d="M10.5 10.5L14 14"
                stroke="#8A837A"
                strokeWidth="1.33"
                strokeLinecap="round"
              />
            </svg>
            <input
              aria-label="Search by student name or keyword"
              id="search"
              type="search"
              className="search-input"
              placeholder="Search by student name or keyword..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="controls-actions">
            <div className="dropdown-container department">
              <select
                aria-label="Filter by department"
                id="department"
                className="dropdown-select"
                value={selectedDepartment}
                disabled={isDepartmentsPending}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Department: All</option>
                {departments?.map((dept) => (
                  <option
                    key={dept.id}
                    value={dept.id}
                  >
                    {dept.name.toLowerCase() === 'string' ? 'N/A' : dept.name}
                  </option>
                ))}
              </select>
              <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="#6C655D"
                  strokeWidth="1.17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="dropdown-container tag">
              <select
                aria-label="Filter by review tag"
                id="tag"
                className="dropdown-select"
                value={selectedTag}
                disabled={isTagsPending}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tag: All</option>
                {distinctTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="#6C655D"
                  strokeWidth="1.17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="dropdown-container owner">
              <select
                aria-label="Filter by faculty contributor"
                id="owner"
                className="dropdown-select"
                value={selectedOwner}
                onChange={(e) => {
                  setSelectedOwner(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Faculty: All</option>
                <option value="self">You</option>
                {facultyContributors.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="#6C655D"
                  strokeWidth="1.17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <Button
              variant="outline"
              id="clear-filters"
              onClick={handleResetFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {isError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
              fontSize: '14px',
            }}
          >
            <strong>Error loading students:</strong> {error?.message}
          </div>
        )}

        <section id="roster-results" aria-live="polite" aria-label="Student results">
          {!isLoading && students.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'No matching students' : 'No students yet'}
              description={
                hasActiveFilters
                  ? 'Try another review keyword or clear your filters.'
                  : 'Student records will appear here when they are added.'
              }
              action={
                hasActiveFilters ? (
                  <Button
                    id="empty-clear"
                    variant="outline"
                    onClick={handleResetFilters}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <TableContainer className="table-wrap">
              <Table aria-label="Student results">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Visible review tags</TableHead>
                    <TableHead className="ui-table-heading-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody aria-busy={isLoading || undefined}>
                  {isLoading
                    ? [0, 1, 2, 3, 4].map((idx) => (
                        <TableRowSkeleton key={`skeleton-${idx}`} columns={5} />
                      ))
                    : students.map((student: StudentSearchResult) => {
                        const fullName = [
                          student.first_name,
                          student.middle_name,
                          student.last_name,
                        ]
                          .filter(Boolean)
                          .join(' ');
                        const shortProgram = formatShortProgramName(student.program_name);
                        const cleanedTags = sanitizeVisibleReviewTags(student.visible_review_tags);

                        return (
                          <TableRow key={student.id}>
                            <TableCell>{student.student_id_number}</TableCell>
                            <TableCell>
                              <Link
                                to={`/faculty/students/${student.id}`}
                                className="ui-link-neutral"
                              >
                                {fullName}
                              </Link>
                            </TableCell>
                            <TableCell>{shortProgram}</TableCell>
                            <TableCell className="is-315a7a5">
                              {cleanedTags.length > 0 ? (
                                <TagCluster
                                  maxVisible={2}
                                  tags={cleanedTags.map((tag) => ({
                                    label: tag,
                                    variant: getTagBadgeVariant(tag),
                                  }))}
                                />
                              ) : (
                                <Badge variant="neutral">No active reviews</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Link
                                to={`/faculty/students/${student.id}/new-review`}
                                className="ui-link-neutral"
                              >
                                Write review <span className="arrow">&rarr;</span>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </section>

        <TablePaginationFooter
          rowsPerPageSelectId="rows-per-page"
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalEntries={totalEntries}
          pageSize={pageSize}
          isLoading={isLoading}
          entityName="entries"
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </AppShell>
  );
}
