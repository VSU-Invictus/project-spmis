import { useState } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableRowSkeleton,
  EmptyState,
  Badge,
  Button,
  Input,
} from '../../components/ui';
import { useSearchStudents, type StudentSearchResult } from '../../hooks/useSearchStudents';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { Modal } from '../../components/ui/Modal';

export function FacultyStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  const { data: students, isPending, isError, error, refetch } = useSearchStudents({
    query: searchTerm.trim() || undefined,
  });

  return (
    <AppShell
      role="faculty"
      activeNavKey="students"
      breadcrumb="Faculty Portal / Student Roster"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Student Directory
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Search across university students and browse attributed faculty intelligence.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => refetch()}>
              Refresh Roster
            </Button>
          </div>
        </div>

        {/* Search controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', maxWidth: '480px' }}>
          <Input
            placeholder="Search by student name or ID number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Error notification */}
        {isError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
              fontSize: '14px',
            }}
          >
            <strong>Error loading students from Prism mock:</strong> {error?.message}
          </div>
        )}

        {/* Students Data Table */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '140px' }}>Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Review Tags</TableHead>
                <TableHead style={{ width: '130px', textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              )}

              {!isPending && (!students || students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} style={{ padding: '36px 0', textAlign: 'center' }}>
                    <EmptyState
                      title="No students matched your search"
                      description="Adjust your search keywords or clear the search input to view the complete roster."
                    />
                  </TableCell>
                </TableRow>
              )}

              {!isPending &&
                students?.map((student) => {
                  const fullName = [student.first_name, student.middle_name, student.last_name]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <TableRow key={student.id}>
                      <TableCell style={{ fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                        {student.student_id_number}
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground, #64748b)' }}>
                          Registered via {student.registration_source === 'admin_direct' ? 'Admin Direct' : 'Faculty Application'}
                        </div>
                      </TableCell>
                      <TableCell>{student.program_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {student.visible_review_tags && student.visible_review_tags.length > 0 ? (
                            student.visible_review_tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline">
                                #{tag}
                              </Badge>
                            ))
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--muted-foreground, #94a3b8)' }}>
                              No review tags yet
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Reviews
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Student Reviews Modal */}
      {selectedStudent && (
        <StudentReviewsDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </AppShell>
  );
}

function StudentReviewsDialog({
  student,
  onClose,
}: {
  student: StudentSearchResult;
  onClose: () => void;
}) {
  const { data: reviews, isPending, isError } = useStudentReviews({
    student_id: `eq.${student.id}`,
    status: 'eq.active',
  });

  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Reviews for ${fullName}`}
      description={`${student.student_id_number} · ${student.program_name}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
        {isPending && <p>Loading reviews from Prism mock...</p>}
        {isError && <p style={{ color: 'var(--destructive)' }}>Failed to load reviews.</p>}
        {!isPending && (!reviews || reviews.length === 0) && (
          <EmptyState
            title="No reviews yet"
            description="Be the first faculty member to submit a review for this student."
          />
        )}
        {!isPending &&
          reviews?.map((review) => (
            <div
              key={review.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px',
                backgroundColor: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {review.author_name || 'Faculty Member'} ({review.author_department_name || 'Department'})
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.5 }}>
                {review.body_text}
              </p>
              {review.tags && review.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {review.tags.map((tag, idx) => (
                    <Badge key={idx} variant="muted">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
