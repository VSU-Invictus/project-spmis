import type { QueueType } from '../components/queue-modal/queues';

/** Mock-only fixtures. Zero real data (ai-context.md §4). */
export interface QueueColumn {
  key: string;
  label: string;
  colClass?: string;
  align?: 'left' | 'center' | 'right';
}

export interface QueueRow {
  id: string;
  status: 'Pending' | 'Active' | 'Approved' | 'Rejected';
  source?: 'Faculty Applied' | 'Admin Direct';
  cells: Record<string, string>;
}

export const QUEUE_COLUMNS: Record<QueueType, QueueColumn[]> = {
  student: [
    { key: 'studentId', label: 'Student ID', colClass: 'col-id' },
    { key: 'name', label: 'Name', colClass: 'col-name' },
    { key: 'program', label: 'Program', colClass: 'col-program' },
    { key: 'date', label: 'Applied Date', colClass: 'col-date' }
  ],
  department: [
    { key: 'department', label: 'Department', colClass: 'col-program' },
    { key: 'proposedBy', label: 'Proposed by', colClass: 'col-proposed' },
    { key: 'type', label: 'Request Type', colClass: 'col-type', align: 'center' },
    { key: 'date', label: 'Submission Date', colClass: 'col-date' }
  ],
  program: [
    { key: 'program', label: 'Program', colClass: 'col-program' },
    { key: 'proposedBy', label: 'Proposed by', colClass: 'col-proposed' },
    { key: 'type', label: 'Request Type', colClass: 'col-type', align: 'center' },
    { key: 'date', label: 'Submission Date', colClass: 'col-date' }
  ],
  faculty: [
    { key: 'name', label: 'Name', colClass: 'col-name' },
    { key: 'email', label: 'Email Address', colClass: 'col-email' },
    { key: 'department', label: 'Department', colClass: 'col-dept' },
    { key: 'role', label: 'Role', colClass: 'col-role', align: 'center' },
    { key: 'status', label: 'Status', colClass: 'col-status', align: 'center' },
    { key: 'date', label: 'Registered Date', colClass: 'col-date' }
  ]
};

export const QUEUE_FIXTURES: Record<QueueType, QueueRow[]> = {
  student: [
    {
      id: 'stu-1',
      status: 'Pending',
      cells: {
        studentId: '2026-00102',
        name: 'Radz Ponce Moreno',
        program: 'BS in Computer Science',
        date: '2026-09-10'
      }
    },
    {
      id: 'stu-2',
      status: 'Pending',
      cells: {
        studentId: '2026-00104',
        name: 'Gian Suico Duterte Marcos',
        program: 'BS in Information System',
        date: '2026-09-09'
      }
    },
    {
      id: 'stu-3',
      status: 'Pending',
      cells: {
        studentId: '2026-00106',
        name: 'Christian Grey Santos',
        program: 'BS in Computer Science',
        date: '2026-09-08'
      }
    },
    {
      id: 'stu-4',
      status: 'Pending',
      cells: {
        studentId: '2026-00108',
        name: 'Lucas Scott Diaz',
        program: 'BS in Artificial Intelligence',
        date: '2026-09-07'
      }
    },
    {
      id: 'stu-5',
      status: 'Pending',
      cells: {
        studentId: '2026-00109',
        name: 'Samantha Jones Ramos',
        program: 'MS in Data Science',
        date: '2026-09-06'
      }
    },
    {
      id: 'stu-6',
      status: 'Pending',
      cells: {
        studentId: '2026-00111',
        name: 'Chloe Frazer Bautista',
        program: 'BS in Software Engineering',
        date: '2026-09-05'
      }
    },
    {
      id: 'stu-7',
      status: 'Pending',
      cells: {
        studentId: '2026-00113',
        name: 'Sadie Adler Mendoza',
        program: 'BS in Medical Technology',
        date: '2026-09-04'
      }
    },
    {
      id: 'stu-8',
      status: 'Pending',
      cells: {
        studentId: '2026-00114',
        name: 'John Marston Castillo',
        program: 'BS in Civil Engineering',
        date: '2026-09-04'
      }
    },
    {
      id: 'stu-9',
      status: 'Pending',
      cells: {
        studentId: '2026-00116',
        name: 'Charles Smith Navarro',
        program: 'Master of Science in AI',
        date: '2026-09-03'
      }
    },
    {
      id: 'stu-10',
      status: 'Pending',
      cells: {
        studentId: '2026-00118',
        name: 'Micah Bell Gonzales',
        program: 'BS in Cloud Computing',
        date: '2026-09-02'
      }
    },
    {
      id: 'stu-11',
      status: 'Pending',
      cells: {
        studentId: '2026-00120',
        name: 'Karen Jones Hernandez',
        program: 'BS in Health Informatics',
        date: '2026-09-01'
      }
    },
    {
      id: 'stu-12',
      status: 'Pending',
      cells: {
        studentId: '2026-00122',
        name: 'Mary Linton Aquino',
        program: 'BS in Quantum Computing',
        date: '2026-08-30'
      }
    }
  ],
  department: [
    {
      id: 'dep-1',
      status: 'Pending',
      cells: {
        department: 'Department in Computer Science',
        proposedBy: 'John Doe',
        type: 'Edit Existing',
        date: '2026-09-10'
      }
    },
    {
      id: 'dep-2',
      status: 'Pending',
      cells: {
        department: 'Department in Computer Engineering',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'dep-3',
      status: 'Pending',
      cells: {
        department: 'Department In Medical Technology',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'dep-4',
      status: 'Pending',
      cells: {
        department: 'Department in Information System',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'dep-5',
      status: 'Pending',
      cells: {
        department: 'Department in Applied Mathematics',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'dep-6',
      status: 'Pending',
      cells: {
        department: 'Department of Artificial Intelligence',
        proposedBy: 'Dr. Alan Turing',
        type: 'Addition',
        date: '2026-09-09'
      }
    },
    {
      id: 'dep-7',
      status: 'Pending',
      cells: {
        department: 'Department of Cyber Security',
        proposedBy: 'Sarah Connor',
        type: 'Addition',
        date: '2026-09-09'
      }
    },
    {
      id: 'dep-8',
      status: 'Pending',
      cells: {
        department: 'Department of Data Science',
        proposedBy: 'Ada Lovelace',
        type: 'Addition',
        date: '2026-09-08'
      }
    },
    {
      id: 'dep-9',
      status: 'Pending',
      cells: {
        department: 'Department of Software Engineering',
        proposedBy: 'Linus Torvalds',
        type: 'Edit Existing',
        date: '2026-09-08'
      }
    },
    {
      id: 'dep-10',
      status: 'Pending',
      cells: {
        department: 'Department of Electrical Engineering',
        proposedBy: 'Nikola Tesla',
        type: 'Edit Existing',
        date: '2026-09-07'
      }
    },
    {
      id: 'dep-11',
      status: 'Pending',
      cells: {
        department: 'Department of Mechanical Engineering',
        proposedBy: 'James Watt',
        type: 'Addition',
        date: '2026-09-07'
      }
    },
    {
      id: 'dep-12',
      status: 'Pending',
      cells: {
        department: 'Department of Chemical Engineering',
        proposedBy: 'Marie Curie',
        type: 'Edit Existing',
        date: '2026-09-06'
      }
    },
    {
      id: 'dep-13',
      status: 'Pending',
      cells: {
        department: 'Department of Biotechnology',
        proposedBy: 'Rosalind Franklin',
        type: 'Addition',
        date: '2026-09-06'
      }
    },
    {
      id: 'dep-14',
      status: 'Pending',
      cells: {
        department: 'Department of Civil Engineering',
        proposedBy: 'Thomas Telford',
        type: 'Edit Existing',
        date: '2026-09-05'
      }
    },
    {
      id: 'dep-15',
      status: 'Pending',
      cells: {
        department: 'Department of Environmental Science',
        proposedBy: 'Rachel Carson',
        type: 'Addition',
        date: '2026-09-05'
      }
    },
    {
      id: 'dep-16',
      status: 'Pending',
      cells: {
        department: 'Department of Physics',
        proposedBy: 'Albert Einstein',
        type: 'Edit Existing',
        date: '2026-09-04'
      }
    },
    {
      id: 'dep-17',
      status: 'Pending',
      cells: {
        department: 'Department of Chemistry',
        proposedBy: 'Dmitri Mendeleev',
        type: 'Addition',
        date: '2026-09-04'
      }
    },
    {
      id: 'dep-18',
      status: 'Pending',
      cells: {
        department: 'Department of Statistics',
        proposedBy: 'Florence Nightingale',
        type: 'Edit Existing',
        date: '2026-09-03'
      }
    },
    {
      id: 'dep-19',
      status: 'Pending',
      cells: {
        department: 'Department of Robotics',
        proposedBy: 'Isaac Asimov',
        type: 'Addition',
        date: '2026-09-03'
      }
    },
    {
      id: 'dep-20',
      status: 'Pending',
      cells: {
        department: 'Department of Aerospace Engineering',
        proposedBy: 'Neil Armstrong',
        type: 'Addition',
        date: '2026-09-02'
      }
    }
  ],
  program: [
    {
      id: 'prg-1',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Computer Science',
        proposedBy: 'John Doe',
        type: 'Edit Existing',
        date: '2026-09-10'
      }
    },
    {
      id: 'prg-2',
      status: 'Pending',
      cells: {
        program: 'Master of Science in Computer Science',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'prg-3',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Medical Technology',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'prg-4',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Information System',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'prg-5',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Applied Mathematics',
        proposedBy: 'John Doe',
        type: 'Addition',
        date: '2026-09-10'
      }
    },
    {
      id: 'prg-6',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Artificial Intelligence',
        proposedBy: 'Dr. Aris Thorne',
        type: 'Addition',
        date: '2026-09-09'
      }
    },
    {
      id: 'prg-7',
      status: 'Pending',
      cells: {
        program: 'Master of Science in Data Analytics',
        proposedBy: 'Dr. Elena Rostova',
        type: 'Addition',
        date: '2026-09-09'
      }
    },
    {
      id: 'prg-8',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Cybersecurity',
        proposedBy: 'Marcus Brody',
        type: 'Addition',
        date: '2026-09-08'
      }
    },
    {
      id: 'prg-9',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Software Engineering',
        proposedBy: 'Sarah Jenkins',
        type: 'Edit Existing',
        date: '2026-09-08'
      }
    },
    {
      id: 'prg-10',
      status: 'Pending',
      cells: {
        program: 'Master of Science in Information Technology',
        proposedBy: 'Arthur Pendelton',
        type: 'Addition',
        date: '2026-09-07'
      }
    },
    {
      id: 'prg-11',
      status: 'Pending',
      cells: {
        program: 'Doctor of Philosophy in Computer Science',
        proposedBy: 'Eleanor Vance',
        type: 'Addition',
        date: '2026-09-07'
      }
    },
    {
      id: 'prg-12',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Civil Engineering',
        proposedBy: 'Robert Taylor',
        type: 'Edit Existing',
        date: '2026-09-06'
      }
    },
    {
      id: 'prg-13',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Electrical Engineering',
        proposedBy: 'Clara Oswald',
        type: 'Addition',
        date: '2026-09-06'
      }
    },
    {
      id: 'prg-14',
      status: 'Pending',
      cells: {
        program: 'Master of Engineering in Robotics',
        proposedBy: 'Victor Stone',
        type: 'Addition',
        date: '2026-09-05'
      }
    },
    {
      id: 'prg-15',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Biotechnology',
        proposedBy: 'Rosalind Franklin',
        type: 'Edit Existing',
        date: '2026-09-05'
      }
    },
    {
      id: 'prg-16',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Cloud Computing',
        proposedBy: 'David Bowman',
        type: 'Addition',
        date: '2026-09-04'
      }
    },
    {
      id: 'prg-17',
      status: 'Pending',
      cells: {
        program: 'Master of Science in Applied Physics',
        proposedBy: 'Richard Feynman',
        type: 'Edit Existing',
        date: '2026-09-04'
      }
    },
    {
      id: 'prg-18',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Digital Media Arts',
        proposedBy: 'Maya Lin',
        type: 'Addition',
        date: '2026-09-03'
      }
    },
    {
      id: 'prg-19',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Health Informatics',
        proposedBy: 'Jonas Salk',
        type: 'Addition',
        date: '2026-09-03'
      }
    },
    {
      id: 'prg-20',
      status: 'Pending',
      cells: {
        program: 'Bachelor of Science in Quantum Computing',
        proposedBy: 'Bruce Wayne',
        type: 'Addition',
        date: '2026-09-02'
      }
    }
  ],
  faculty: [
    {
      id: 'fac-1',
      status: 'Pending',
      cells: {
        name: 'Dr. Eleanor Vance',
        email: 'e.vance@university.edu',
        department: 'Department of Computer Science',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-10'
      }
    },
    {
      id: 'fac-2',
      status: 'Active',
      cells: {
        name: 'Prof. Marcus Brody',
        email: 'm.brody@university.edu',
        department: 'Department of Information Technology',
        role: 'Admin',
        status: 'Active',
        date: '2026-09-09'
      }
    },
    {
      id: 'fac-3',
      status: 'Pending',
      cells: {
        name: 'Dr. Sophia Al-Mansoor',
        email: 's.almansoor@university.edu',
        department: 'Department of Applied Mathematics',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-08'
      }
    },
    {
      id: 'fac-4',
      status: 'Active',
      cells: {
        name: 'Prof. Arthur Pendelton',
        email: 'a.pendelton@university.edu',
        department: 'Department of Biological Sciences',
        role: 'Faculty',
        status: 'Active',
        date: '2026-09-05'
      }
    },
    {
      id: 'fac-5',
      status: 'Pending',
      cells: {
        name: 'Dr. Aris Thorne',
        email: 'a.thorne@university.edu',
        department: 'Department of Artificial Intelligence',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-05'
      }
    },
    {
      id: 'fac-6',
      status: 'Active',
      cells: {
        name: 'Dr. Elena Rostova',
        email: 'e.rostova@university.edu',
        department: 'Department of Data Science',
        role: 'Faculty',
        status: 'Active',
        date: '2026-09-04'
      }
    },
    {
      id: 'fac-7',
      status: 'Pending',
      cells: {
        name: 'Prof. Jonathan Byers',
        email: 'j.byers@university.edu',
        department: 'Department of Software Engineering',
        role: 'Admin',
        status: 'Pending',
        date: '2026-09-04'
      }
    },
    {
      id: 'fac-8',
      status: 'Active',
      cells: {
        name: 'Dr. Clara Oswald',
        email: 'c.oswald@university.edu',
        department: 'Department of Electrical Engineering',
        role: 'Faculty',
        status: 'Active',
        date: '2026-09-03'
      }
    },
    {
      id: 'fac-9',
      status: 'Pending',
      cells: {
        name: 'Dr. Victor Stone',
        email: 'v.stone@university.edu',
        department: 'Department of Mechanical Engineering',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-03'
      }
    },
    {
      id: 'fac-10',
      status: 'Active',
      cells: {
        name: 'Prof. Sarah Jenkins',
        email: 's.jenkins@university.edu',
        department: 'Department of Computer Science',
        role: 'Faculty',
        status: 'Active',
        date: '2026-09-02'
      }
    },
    {
      id: 'fac-11',
      status: 'Pending',
      cells: {
        name: 'Dr. Robert Taylor',
        email: 'r.taylor@university.edu',
        department: 'Department of Civil Engineering',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-02'
      }
    },
    {
      id: 'fac-12',
      status: 'Active',
      cells: {
        name: 'Prof. David Bowman',
        email: 'd.bowman@university.edu',
        department: 'Department of Cloud Computing',
        role: 'Admin',
        status: 'Active',
        date: '2026-09-01'
      }
    },
    {
      id: 'fac-13',
      status: 'Pending',
      cells: {
        name: 'Dr. Maya Lin',
        email: 'm.lin@university.edu',
        department: 'Department of Digital Media Arts',
        role: 'Faculty',
        status: 'Pending',
        date: '2026-09-01'
      }
    },
    {
      id: 'fac-14',
      status: 'Active',
      cells: {
        name: 'Prof. Jonas Salk',
        email: 'j.salk@university.edu',
        department: 'Department of Medical Technology',
        role: 'Faculty',
        status: 'Active',
        date: '2026-08-31'
      }
    },
    {
      id: 'fac-15',
      status: 'Pending',
      cells: {
        name: 'Dr. Bruce Wayne',
        email: 'b.wayne@university.edu',
        department: 'Department of Cybersecurity',
        role: 'Admin',
        status: 'Pending',
        date: '2026-08-30'
      }
    },
    {
      id: 'fac-16',
      status: 'Active',
      cells: {
        name: 'Prof. Shigeru Miyamoto',
        email: 's.miyamoto@university.edu',
        department: 'Department of Game Development',
        role: 'Faculty',
        status: 'Active',
        date: '2026-08-30'
      }
    }
  ]
};
