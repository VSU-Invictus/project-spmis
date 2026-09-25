# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting #5

* **Date:** 19 September 2026
* **Meeting:** Fourth Weekly Project Meeting for SMPIS
* **Time:** 10:20 PM to 11:01 PM
* **Platform:** Discord
* **Attendance:** 11 of 11 members present
* **Absentees:** None

---

### I. CALL TO ORDER
The fourth weekly project meeting was called to order at 10:20. All 11 members were present.

### II. AGENDA AND DISCUSSION

#### 1. Review of Presentation Notes & Mockup Corrections
The Project Secretary discussed the notes and UI feedback from the previous presentation. The following corrections must be implemented:
* **Global UI:** Standardize the design system, reuse components (shadcn/ui), harmonize the Claude+ dark mode theme by adding light accents, and add icons to clickable elements for better affordance.
* **Authentication & Navigation:** Require Terms and Conditions before sign-up. Rename "Chat" to "AI Chat Assistant" in the NavBar.
* **Faculty Portal:** Remove "Programs" from the dashboard and change quick links to a public review news feed. Fix bolding typography in the Students tab, add a color accent to the 4th column in the Students table, and reduce the Departments search bar width.
* **Student Profile & Reviews:** Improve visual hierarchy in fonts. Add an AI-powered summary before visible reviews. Change the "Write Review" button to white, enable rich-text and file attachments for reviews, and implement autocomplete for tags. Convert "Register Student" to a pop-up modal.
* **Admin Portal:** Move "Pending Applications" to the Admin Dashboard. Rename "Applications" to "Logs" and adjust widths for status and search filters.
* **Components & Docs:** Add right-pointing arrows to action buttons, implement a success toast notification (upper right) after "add" actions, create a change log folder in docs/, and update the AI project context file.

#### 2. UI/UX Team Designation
* Dedicated UI/UX roles were established to handle the overall design system and lead mockup corrections.
* Monarch Asis and Radz Ponce Moreno volunteered for the role.
* The Project Manager assigned Carl Roy Arañez to join them.
* These three members will hold dual responsibilities (their originally assigned development roles plus UI/UX duties).

#### 3. Component System and Design Standardization
* The immediate priority is to build a universal component system to serve as the single source of truth for the overall design.
* This must be completed before proceeding with the cleanup of the HTML mockups.
* The team will use tweakcn as the foundation, basing the component design on the agreed-upon Claude+ theme.

#### 4. Issue Tracker Protocol for Suggestions
* Members are strictly prohibited from creating GitHub Issues for feature suggestions or desired functional changes.
* All suggestions must be raised and settled verbally during weekly meetings.
* GitHub Issues are to be reserved for actual bugs and approved tasks.

### III. DECISION MADE
* Monarch Asis, Radz Ponce Moreno, and Carl Roy Arañez are officially designated as the UI/UX team alongside their current roles.
* The establishment of a unified component system based on tweakcn and Claude+ is the top project priority and a prerequisite for further mockup cleanup.
* Feature suggestions and functional changes will no longer be tracked via GitHub Issues; they must be discussed in weekly meetings.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Build universal component system based on Claude+ | Frontend Team | Ongoing |
| Clean up HTML mockups based on presentation notes | Frontend Team | Pending |
| Add change logs to docs/ | Geryme M. Vega (Secretary) | Pending |

*Note: "Pending" status indicates that a task cannot be started until subsequent prerequisite steps are completed.*

### V. ADJOURNMENT
The meeting was concluded at 11:01 following the establishment of the UI/UX team, establishment of project priority, and new issue-tracking protocols.

### VI. SIGNATORIES
*(Signatures not available in markdown format; please refer to the original PDF)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Project Manager, SPMIS*