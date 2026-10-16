export interface DepartmentItem {
  id: string;
  name: string;
  status: 'approved';
}

export interface StudentItem {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  program: string;
}

export interface ProgramItem {
  id: string;
  name: string;
  status: 'approved';
}

export interface FacultyItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'faculty' | 'admin';
}

export const DEPARTMENTS_FIXTURE: DepartmentItem[] = [
  { id: 'dept-1', name: 'Department of Computer Science', status: 'approved' },
  { id: 'dept-2', name: 'Department of Computer Engineering', status: 'approved' },
  { id: 'dept-3', name: 'Department of Medical Technology', status: 'approved' },
  { id: 'dept-4', name: 'Department of Information System', status: 'approved' },
  { id: 'dept-5', name: 'Department of Applied Mathematics', status: 'approved' },
  { id: 'dept-6', name: 'Department of Data Science', status: 'approved' },
  { id: 'dept-7', name: 'Department of Cybersecurity', status: 'approved' },
  { id: 'dept-8', name: 'Department of Physics', status: 'approved' },
  { id: 'dept-9', name: 'Department of Biology', status: 'approved' }
];

export const STUDENTS_FIXTURE: StudentItem[] = [
  { id: '27-1-12345', firstName: 'Dubai Chu Wee', middleName: 'Coo', lastName: 'Ki', program: 'BS in Computer Science' },
  { id: '27-1-67676', firstName: 'Syx', middleName: 'Sev', lastName: 'Vyn', program: 'BS in Computer Engineering' },
  { id: '27-1-76767', firstName: 'Ca', middleName: 'Is', lastName: 'Mille', program: 'BS in Medical Technology' },
  { id: '27-1-12870', firstName: 'Dag Gan', middleName: 'Land', lastName: 'Silot', program: 'BS in Information System' },
  { id: '27-1-98917', firstName: 'Chat', middleName: 'Ge', lastName: 'Pity', program: 'BS In Applied Mathematics' }
];

export const PROGRAMS_FIXTURE: ProgramItem[] = [
  { id: 'prog-1', name: 'Bachelor of Science in Computer Science', status: 'approved' },
  { id: 'prog-2', name: 'Bachelor of Science in Computer Engineering', status: 'approved' },
  { id: 'prog-3', name: 'Bachelor of Science in Medical Technology', status: 'approved' },
  { id: 'prog-4', name: 'Bachelor of Science in Information Systems', status: 'approved' },
  { id: 'prog-5', name: 'Bachelor of Science in Applied Mathematics', status: 'approved' },
  { id: 'prog-6', name: 'Bachelor of Science in Data Science', status: 'approved' },
  { id: 'prog-7', name: 'Bachelor of Science in Artificial Intelligence', status: 'approved' },
  { id: 'prog-8', name: 'Bachelor of Science in Cybersecurity', status: 'approved' },
  { id: 'prog-9', name: 'Bachelor of Science in Software Engineering', status: 'approved' },
  { id: 'prog-10', name: 'Bachelor of Arts in Digital Media', status: 'approved' },
  { id: 'prog-11', name: 'Bachelor of Arts in Game Design', status: 'approved' }
];

export const FACULTY_FIXTURE: FacultyItem[] = [
  { id: 'fac-1', name: 'Dr. Eleanor Vance', email: 'e.vance@university.edu', department: 'Department of Computer Science', role: 'faculty' },
  { id: 'fac-2', name: 'Prof. Marcus Brody', email: 'm.brody@university.edu', department: 'Department of Information Technology', role: 'admin' },
  { id: 'fac-3', name: 'Dr. Sophia Al-Mansoor', email: 's.almansoor@university.edu', department: 'Department of Applied Mathematics', role: 'faculty' },
  { id: 'fac-4', name: 'Prof. Arthur Pendelton', email: 'a.pendelton@university.edu', department: 'Department of Biological Sciences', role: 'faculty' }
];

export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  program: string;
  yearLevel: string;
  statusLabel: string;
  statusVariant: 'success' | 'warning' | 'info';
}

export const ROSTER_STUDENTS: RosterStudent[] = [
  { id: '24-1-00001', name: 'Sam Lee Parker', email: 'sam.parker@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '3rd Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
  { id: '24-1-00042', name: 'Elena Bautista', email: 'elena.b@vsu.edu.ph', program: 'BS Information Systems', yearLevel: '2nd Year', statusLabel: 'Pending Review', statusVariant: 'warning' },
  { id: '24-1-00109', name: 'Rafael Cruz', email: 'r.cruz@vsu.edu.ph', program: 'BS Information Technology', yearLevel: '4th Year', statusLabel: 'In Progress', statusVariant: 'info' },
  { id: '24-1-00210', name: 'Adrian Davis', email: 'adrian.d@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '3rd Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
  { id: '24-1-00211', name: 'Liam Moore', email: 'liam.m@vsu.edu.ph', program: 'BS Information Systems', yearLevel: '1st Year', statusLabel: 'In Progress', statusVariant: 'info' },
  { id: '24-1-00212', name: 'Kaitlyn Smith', email: 'k.smith@vsu.edu.ph', program: 'BS Computer Engineering', yearLevel: '4th Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
  { id: '24-1-00213', name: 'Justin Taylor', email: 'j.taylor@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '2nd Year', statusLabel: 'Pending Review', statusVariant: 'warning' },
  { id: '24-1-00214', name: 'Mia Johnson', email: 'm.johnson@vsu.edu.ph', program: 'BS Data Science', yearLevel: '1st Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
  { id: '24-1-00215', name: 'Ethan White', email: 'e.white@vsu.edu.ph', program: 'BS Artificial Intelligence', yearLevel: '3rd Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
  { id: '24-1-00216', name: 'Chloe Brown', email: 'c.brown@vsu.edu.ph', program: 'BS Computer Science', yearLevel: '4th Year', statusLabel: 'Approved / Active', statusVariant: 'success' },
];


