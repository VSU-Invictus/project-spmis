
# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting #8

* **Date:** 10 October 2026
* **Meeting:** Seventh Weekly Project Meeting for SPMIS
* **Time:** 9:15 PM to 9:42 PM
* **Platform:** Discord
* **Attendance:** 10 of 11 members present (Quorum met)
* **Absentees:** Radz Ponce Moreno

---

### I. CALL TO ORDER
The seventh weekly project meeting was called to order at 9:15 PM through Discord. Ten of the eleven members were present, meeting the required quorum.

### II. AGENDA AND DISCUSSION

#### 1. Project Progress and Remaining QA Requests
The team discussed the current status of the mockup development and the remaining tasks required before its final presentation.
* All issues requested have been completed, with the remaining work primarily consisting of QA-related improvements.
* A document detailing the remaining QA requests was shared in the group chat, with the corresponding issues available on GitHub.
* The Frontend Lead recommended creating separate GitHub Issues for each improvement identified in the QA documentation to simplify task assignment, Pull Request (PR) reviews, and progress tracking.
* The team reiterated that repository-wide changes should be deferred until all individually assigned issues have been completed to avoid disrupting members working on their respective branches

#### 2. Dashboard Improvements and Design System Compliance
The Team Lead (TL) requested recommendations for further improving the dashboards, emphasizing their importance during the upcoming mockup presentation.

The following concerns and recommendations were discussed:
* **Admin Dashboard:** Improvements to the presentation of recent activities were suggested to enhance the dashboard's overall appearance and usability.
* **Dashboard Readiness:** The Frontend Lead reaffirmed that the dashboard was generally satisfactory while acknowledging the remaining improvements.
* **Admin Portal Loading Behavior:** QA identified inconsistencies in skeleton loading across the Admin Portal, noting that some tabs lacked loading placeholders despite their presence in the Faculty Portal.
* **Faculty Dashboard Quick Links:** QA identified that the quick links did not follow the highlighting behavior established in the design system. The team was instructed to correct this inconsistency.

#### 3. Rejection Flow and Approval Queue Behavior
The team reviewed QA feedback concerning the rejection flow and the placement of rejection controls within the approval queue.
* QA raised a concern regarding the expected distinction between single and bulk rejection. The original design placed bulk rejection controls at the bottom and individual rejection controls beside their corresponding rows.
* It was observed that the current implementation places rejection controls beside the rows, including during bulk rejection.
* The TL clarified that this behavior was intentional, as the original layout would provide insufficient space for the rejection text.
* QA recommended updating the relevant PR checklist to reflect the intended behavior and prevent confusion during review.

#### 4. Terms and Conditions Flow
The team revisited the current Terms and Conditions acknowledgment behavior.
* The existing implementation allows users to acknowledge the terms without requiring them to scroll to the bottom of the document.
* The team agreed to retain the current behavior for the time being, as mandatory scrolling had been identified as optional.
* The flow will be presented again during the upcoming Tuesday presentation and may be revised depending on the feedback received.

#### 5. Mockup Presentation and Milestone 2 Preparation
The team established the target schedule for presenting the updated mockup and proceeding with the next development milestone.
* The updated mockup is scheduled for presentation on Tuesday, October 13, 2026, at 1:00 PM.
* The team aims to complete the remaining Admin Portal improvements before the presentation.
* If the presentation and evaluation proceed favorably, the team intends to begin Milestone 2.
* The presentation will be conducted by the available team members, together with the TL and the Secretary.

### III. DECISION MADE
* The remaining QA improvements will be organized into individual GitHub Issues to facilitate assignment, implementation, and PR reviews.
* Repository-wide changes will be deferred until the completion of existing individual tasks to minimize disruption to ongoing development.
* The current rejection control placement will be retained as an intentional design decision, with the relevant PR checklist recommended for updating to reflect the implementation.
* The current Terms and Conditions acknowledgment flow will remain unchanged pending further feedback during the upcoming presentation.
* The identified dashboard and loading inconsistencies will be addressed as part of the remaining mockup improvements.
* The updated mockup will be presented on October 13, 2026, at 1:00 PM, with the intention of proceeding to Milestone 2 following a favorable evaluation.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Complete the remaining QA improvements identified and those in the shared documentation | Frontend and Backend Teams | Ongoing |
| Organize individual GitHub Issues for the remaining QA improvements | Frontend Team | Ongoing |
| Update the relevant PR checklist to reflect the intended rejection flow behavior | Assigned PR Author | Ongoing |

**Note:** "Pending" status indicates the task is yet to be initiated.

### V. ADJOURNMENT
The meeting was concluded at 9:42 PM following discussions on the remaining QA improvements, dashboard enhancements, design system inconsistencies, rejection flow behavior, Terms and Conditions acknowledgment, repository-wide changes, and preparations for the upcoming mockup presentation and Milestone 2.

### VI. SIGNATORIES
*(Signatures not available in markdown format; please refer to the original PDF)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Project Manager, SPMIS*
