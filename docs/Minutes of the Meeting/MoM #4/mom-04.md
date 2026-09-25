# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting

* **Date:** 14 September 2026
* **Meeting:** Emergency Meeting to Settle Figma to HTML Migration
* **Time:** 9:40 PM to 10:07 PM
* **Platform:** Discord
* **Attendance:** 7 of 7 members present (Backend and Frontend Groups)
* **Absentees:** None

---

### I. CALL TO ORDER
The emergency project meeting was conducted from 9:40 PM to 10:07 PM. All 7 invited members from the Backend and Frontend groups were present. The QA group was not required for this meeting.

### II. AGENDA AND DISCUSSION

#### Workflow and Communication Protocol
* Members must notify the team in the `branch-update` channel every time they start or stop working.
* **Format:** `@everyone <key words> on <branch name> for <Auth /Faculty Portal/Admin Portal>`
* **Approved Tracking Key Words:** `started working`, `now working`, `stopped working`, `finished working`.
* **Example:** `@everyone started working on feat/mock-up/admin-portal/department-applications for Admin Portal`
* If a Pull Request (PR) is created, the assigned reviewer must be notified in the `code-review` channel.

#### HTML Migration Rules and File Structure
* **Rule:** Each site map corresponds to exactly one HTML file.
* The exact directory structure for the `/mockups` folder was finalized as follows:

```text
/mockups
├── pages/
│   ├── auth/                             <!-- Public & Auth Routes -->
│   │   ├── login.html                    <!-- "Sign in with Google" -->
│   │   ├── pending-verification.html     <!-- Shown while awaiting admin approval -->
│   │   └── terms.html                    <!-- Required Terms & Conditions -->
│   ├── admin/                            <!-- Admin Portal Routes -->
│   │   ├── dashboard.html                <!-- System-wide stats & queue counts -->
│   │   ├── faculty-applications.html     <!-- Search & bulk approve/reject -->
│   │   ├── student-applications.html     <!-- Search & bulk approve/reject -->
│   │   ├── program-applications.html     <!-- Search & bulk approve/reject -->
│   │   ├── department-applications.html  <!-- Search & bulk approve/reject -->
│   │   ├── students.html                 <!-- Direct-add/manage students -->
│   │   ├── departments.html              <!-- Direct CRUD on managed lists -->
│   │   ├── programs.html                 <!-- Direct CRUD on managed lists -->
│   │   ├── faculty.html                  <!-- Manage accounts and override fields -->
│   │   └── audit-log.html                <!-- Read-only, metadata-level audit trail -->
│   └── faculty/                          <!-- Faculty Portal Routes -->
│       ├── dashboard.html                <!-- Quick links and application status -->
│       ├── students.html                 <!-- Search/browse students with structured filters -->
│       ├── student-detail.html           <!-- View student basic info and visible reviews -->
│       ├── new-review.html               <!-- Compose a review with free text and tags -->
│       ├── register-student.html         <!-- Apply to register a new student -->
│       ├── chat.html                     <!-- Open, cross-student AI chatbot -->
│       ├── programs.html                 <!-- View list and apply to add/edit -->
│       ├── departments.html              <!-- View list and apply to add -->
│       ├── applications.html             <!-- Status of own pending applications -->
│       └── profile.html                  <!-- Edit own profile (excluding locked fields) -->
├── components/
│   ├── navigation/
│   │   ├── sidebar-admin.html
│   │   └── sidebar-faculty.html
│   ├── tables/
│   │   ├── table-approval-queue.html     <!-- Reusable component for the 4 admin queues -->
│   │   └── table-management-roster.html
│   └── modals/
│       ├── modal-rejection-reason.html
│       ├── modal-add-edit-entity.html
│       └── modal-delete-confirm.html
├── assets/
│   ├── css/
│   │   └── global.css
│   ├── images/
│   └── icons/
└── index.html 
```

### III. DECISION MADE
* A strict format for tracking work progress in the `branch-update` channel is mandatory.
* Reviewers must be immediately pinged in the `code-review` channel upon PR creation.
* The folder and file structure for the Figma to HTML migration is locked to one HTML file per site map section as outlined above.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Follow mandatory work tracking format in `branch-update` | Backend & Frontend Groups | Ongoing |
| Notify reviewers in `code-review` for all PRs | Backend & Frontend Groups | Ongoing |
| Migrate Figma components strictly following the new `/mockups` folder structure | Backend & Frontend Groups | Ongoing |

### V. ADJOURNMENT
The emergency meeting was concluded at 10:07 PM following the finalization of the HTML structure and communication rules.

### VI. SIGNATORIES
*(Signatures not available in markdown format)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Project Manager, SPMIS*