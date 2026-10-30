
# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting #9

* **Date:** 17 October 2026
* **Meeting:** Eighth Weekly Project Meeting for SPMIS
* **Time:** 9:10 PM to 9:51 PM
* **Platform:** Discord
* **Attendance:** 11 of 11 members present
* **Absentees:** None

---

### I. CALL TO ORDER
The eighth weekly project meeting was called to order at 9:10 PM through Discord. All members were present in the meeting.

### II. AGENDA AND DISCUSSION

#### 1. Design System Development and Project Scope
The team discussed the recent feedback comments regarding the implementation of the design system and its integration into the actual frontend application.
* The design system must be developed using React, with backend implementation excluded from its current scope.
* The UI/UX team will convert the existing design system into reusable React components under GitHub Issues #108 to #112. These components will serve as the foundation for actual frontend development.
* Issue #113 will be addressed by the Frontend Team after the design system component migration has been completed.

#### 2. Design System Component Migration and Recommendations
The team showcased the progress of the ongoing design system component migration. The Team Lead (TL) requested recommendations regarding additional UI elements that could be converted into reusable components.

The following components and improvements were discussed:
* The team presented components already developed or undergoing migration, including application queue, navigation, and modal-related components.
* The TL suggested converting the chat box into a reusable component with a status indicator distinguishing AI-generated messages from user messages.
* Badges, buttons, and interactive links will be converted into reusable components.
* Form input elements will be standardized as reusable components.
* Card and table elements will also be converted into components.
* The existing Admin and Faculty sidebar components will be consolidated into a single reusable component.
* The Frontend Lead raised a concern regarding the sidebar loading before the rest of the page. Skeleton loading was suggested to synchronize the sidebar's appearance with the main content.
* The Chat Tags hover effect in the HTML/CSS design system will be removed because the functionality was not implemented in the finalized mockup.
* Header, footer, and toasts will also be converted into reusable components.

#### 3. Component Testing Workflow
Monarch Asis proposed implementing the migrated components locally within the actual application to verify their compatibility with the finalized mockup's appearance and affordances.
* The purpose of the testing is to identify visual inconsistencies or functional issues introduced during component migration.
* Necessary adjustments may be made to the components based on the testing results.
* The TL approved the proposed workflow, provided that changes made solely for debugging purposes are not pushed to the remote repository.

### III. DECISION MADE
* The design system will be implemented using React, with backend development excluded from its current scope.
* The UI/UX team will handle component migration under Issues #108 to #112, while the Frontend Team will address Issue #113 afterward.
* The identified UI elements will be converted into reusable components, including a unified sidebar for the Admin and Faculty portals.
* Local integration testing of migrated components was approved to verify compatibility with the finalized mockup. Debugging-only changes must not be pushed to the remote repository.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Continue converting the design system into reusable React components under Issues #108 to #112 | UI/UX Team | Ongoing |
| Proceed with Issue #113 after the design system migration | Frontend Team | Pending |

**Note:** "Pending" status indicates the task is yet to be initiated.

### V. ADJOURNMENT
The meeting was concluded at 9:51 PM following discussions on the React-based design system, component migration progress, recommendations for reusable UI elements, local component testing, and the planned README documentation updates.

### VI. SIGNATORIES
*(Signatures not available in markdown format; please refer to the original PDF)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Project Manager, SPMIS*
