# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting #6

* **Date:** 26 September 2026
* **Meeting:** Fifth Weekly Project Meeting for SMPIS
* **Time:** 9:00 PM to 9:54 PM
* **Platform:** Discord
* **Attendance:** 10 of 11 members present (Quorum met)
* **Absentees:** Nexus Paloma

---

### I. CALL TO ORDER
The fifth weekly project meeting was called to order at 9:00 PM. 10 of 11 members were present.

### II. AGENDA AND DISCUSSION

#### 1. Discussion of the Universal Design System
* The system now strictly adheres to the Claude+ color palette and overall design structure.
* All colors (accents, foreground, texturing, etc.) are centralized in the root of `global.css`; this must be used as the standard for all design tasks.
* Dark mode and light mode are fully integrated into the design system and are automatically handled upon using the universal design system file.
* Typography standards were established: Primary headings (30-40px), Secondary headings (18-22px), and Paragraph/description text (12px).
* Color roles were defined: Foreground color is used to highlight text, while muted colors are used for description text.
* Status badges and tag fields are fully implemented as suggested during the previous presentation.
* Buttons have affordances enabled, uniform text and colors (no outlining), and a standard default size that can be adjusted as needed.
* Text boxes and input fields are standardized in size and scaling, with rich text formatting to be enabled.
* Standard card designs are available and can be resized if necessary. Chat cards utilize the general card design but are resized to fit the chat interface.
* The chat box is responsive and adjusts to text length. AI chat responses are visually distinct with an orange name indicator. A discussion was held regarding the text color for the user's own message header indication.
* Tables are standardized with embedded tag fields and improved Quality of Life (QoL) affordances, such as a "select all" function.
* User profiles are standardized with affordances; clicking a profile opens a summary. Button links within profiles are fully implemented.
* The signup and login interfaces were updated to a 2-card design (as the design system's default was empty). The left card now displays system details, a change agreed upon by the majority of the members.
* The footer is standardized with appropriate details, clarifying the system version as 1.0 (the golden code).
* **QA Suggestions Addressed:**
    * **Checkboxes:** The default white was too bright for dark mode. A `#52514a` gray was suggested per Claude+ design, but the Frontend Lead advised against gray, deciding on a dirty white to maintain visibility.
    * **Chat Bubbles:** To differentiate user and AI messages (similar to Messenger), the professor's chat bubble will use a different color from the AI text box. The UI/UX group will finalize the colors, considering orange and muted orange.

#### 2. Next Steps and Best Practices
* With the design system complete, frontend team will commence the system redesign.
* **Task Delegation:** GitHub issues have been created. Members may self-assign tasks; the Project Manager (PM) will delegate any unclaimed issues.
* **PR Tracking:** Developers must use strikethrough formatting (or similar markdown) in PR comments to track addressed issues and mark them as completed.
* The Design System must be used at all times for any UI changes moving forward.
* **QA PR Review Protocol:** The Frontend Lead mandated that at least one QA member must review Frontend PRs to provide bite-sized feedback. Valid reasoning must be provided in the PR comments for any redesigns. The majority agreed to this for better task micromanagement within the QA team.
* The PM will create a new issue documenting the expected behavior for every click interaction.
* The Backend Lead (Radz Ponce Moreno) will conduct an internal discussion with the backend team regarding their best practices.
* For every PR, developers must update the changelog based on the guidelines posted in the rules-and-guideline channel.

### III. DECISION MADE
* The universal design system, based on the Claude+ palette and centralized in `global.css` and `design-system.html`, is finalized and mandatory for all UI development.
* Signup and login screens will utilize the approved 2-card layout.
* Frontend PRs now strictly require a review and feedback from at least one QA member before merging.
* Dark mode checkboxes will use a dirty white color, and chat bubbles will be color-coded to distinguish between faculty and AI messages.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Implement UI redesign using the Design System | Frontend Team | Ongoing |
| Review Frontend PRs and provide bite-sized feedback | QA Team | Ongoing |
| Discuss and establish backend best practices | Radz Ponce Moreno (Backend Lead) | Pending |
| Update the changelog for every new Pull Request | Frontend and Backend Teams | Ongoing |

*Note: "Pending" status indicates the task is yet to be initiated internally.*

### V. ADJOURNMENT
The meeting was concluded at 9:54 PM following the finalization of the design system components and the establishment of new PR and QA review protocols.

### VI. SIGNATORIES
*(Signatures not available in markdown format; please refer to the original PDF)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Project Manager, SPMIS*