
# SPMIS: Student Profiling Management Information System
## Minutes of the Meeting #12

* **Date:** 07 November 2026
* **Meeting:** Eleventh Weekly Project Meeting for SPMIS
* **Time:** 9:10 PM to 9:24 PM
* **Platform:** Discord
* **Attendance:** 10 of 11 members present (Quorum met)
* **Absentees:** Liza Mae Caduyac

---

### I. CALL TO ORDER
The eleventh weekly project meeting was called to order at 9:10 through Discord. Ten of the eleven members were present, meeting the required quorum.

### II. AGENDA AND DISCUSSION

#### 1. Milestone 2 Pull Request Status
The team discussed the current status of the Milestone 2 Pull Request (PR) and its readiness for finalization:
* The Milestone 2 PR was confirmed to be completed and submitted.
* The team was awaiting review and feedback to determine whether additional changes or revisions would be required.

#### 2. Development Workflow Formalization
The team discussed and formalized the development and review workflow for the upcoming milestones, including branching conventions, task dependencies, and the distribution of contributions.

The following arrangements were discussed:
* **Milestone Branching:** Each milestone will maintain its own development branch. Upon completion, a Pull Request will be submitted from the milestone branch to `dev` for review by the instructors, rather than directly to `staging`. This workflow will apply to Milestones 3, 4, and 5.
* **Concurrent Development:** The next development priorities are Milestone 3 (Backend) and Milestone 4 (Frontend). The corresponding GitHub Issues have already been prepared, and both milestones will be developed concurrently.
* **Task Dependencies:** The development workflow will follow the sequence illustrated in the presented branching diagram. Tasks positioned earlier in the workflow must be completed before dependent tasks can proceed. For the detailed milestone branching workflow and task dependency diagram, refer to the Markdown version of Minutes of the Meeting No. 12 (`mom-12.md`).

**Milestone Branching and Task Dependency Diagram**

```mermaid
flowchart TB
    I1["Issue 1: CI Merge Gate, OAuth/Gemini Secrets & Shared M4 Packages"]

    I1 --> B3["Branch: feat/m3-backend"]
    I1 --> B4["Branch: feat/m4-frontend"]

    subgraph M3["M3 — Backend Track (Nov 7–12)"]
        direction TB
        I2["Issue 2: SQL Migrations, Triggers, RPCs, RLS & seed.sql"]
        I3["Issue 3: Edge Functions, De-identification & pgvector"]
        I8["Issue 8: pgTAP RLS, Constraints & Body Text Lock Tests"]
        I9["Issue 9: De-identification & Deno Function Tests"]
        I11["Issue 11: Bruno/Postman Collection & M5 E2E Specs"]

        I2 -->|"Tables, RPCs & RLS ready"| I3
        I2 -->|"Schema & RLS ready"| I8
        I3 -->|"Edge Functions ready"| I9
        I8 --> I11
        I9 --> I11
    end

    subgraph M4["M4 — Frontend Track on Prism Mock (Nov 7–12)"]
        direction TB
        I4["Issue 4: SessionContext, Route Guards & Zod Schemas"]
        I5["Issue 5: Review Editor & Student Detail"]
        I6["Issue 6: ChatContext & Search Filters"]
        I7["Issue 7: Admin CRUD & Four Queues"]
        I10["Issue 10: MSW Handlers, Zod Tests & UI Tests"]

        I4 -->|"Zod schemas & guards ready"| I5
        I4 --> I6
        I4 --> I7
        I5 --> I10
        I6 --> I10
        I7 --> I10
    end

    B3 --> I2
    B4 --> I4

    I11 --> P3["Merge PR: feat/m3-backend → dev"]
    I10 --> P4["Merge PR: feat/m4-frontend → dev"]

    P3 --> PROMOTE["Buffer & Promotion: dev → staging → main"]
    P4 --> PROMOTE

    classDef foundation fill:#334155,stroke:#94a3b8,color:#ffffff
    classDef qa fill:#183b53,stroke:#60a5fa,color:#ffffff
    classDef promotion fill:#164e3b,stroke:#4ade80,color:#ffffff

    class I1,B3,B4 foundation
    class I8,I9,I10,I11 qa
    class PROMOTE promotion
```

* **Individual Contributions:** The team discussed balancing the number of commits made by individual members to maintain a fair distribution of project contributions.

#### 3. Development Reminder and Project Timeline
The team was reminded of the established development conventions, documentation requirements, and upcoming project deadlines.
* **Commit Conventions:** All commits must follow the Conventional Commits format to maintain consistency across the repository.
* **GitHub Templates:** Members must use the established templates in the `.github` directory when preparing Pull Requests, task issues, bug reports, and other relevant documentation.
* **Milestone Deadlines:** Milestones 2 and 3 are targeted for completion by November 14 or 15, 2026, while Milestone 5 is expected to be completed before November 27, 2026.
* **Development Freeze:** Beginning November 25, 2026, regular feature development must stop, with only bug fixes permitted.
* **Deployment Schedule:** Deployment is scheduled for November 27, 2026.
* **Final Presentation:** The project presentation is scheduled for December 3, 2026.
* **Development Resumption:** Development will resume immediately upon approval of the Milestone 2 Pull Request.

### III. DECISION MADE
* The completed Milestone 2 Pull Request will await review and approval before further development proceeds.
* Milestones 3, 4, and 5 will follow the established milestone-branch workflow, with Pull Requests submitted to `dev` for instructor review rather than directly to `staging`.
* Milestone 3 (Backend) and Milestone 4 (Frontend) will be developed concurrently, following the established task dependencies.
* Individual commit contributions will be balanced among members to support fair distribution of project work.
* Members must follow Conventional Commits and use the prescribed GitHub templates for project submissions.
* The development freeze will begin on November 25, 2026, limiting subsequent work to bug fixes.
* Deployment is scheduled for November 27, 2026, followed by the project presentation on December 3, 2026.

### IV. ACTION ITEMS

| Action Item | Responsible Member(s) | Status |
| :--- | :--- | :--- |
| Await review and approval of the completed Milestone 2 Pull Request and address any required revisions | Assigned Milestone 2 Members | Pending |
| Begin concurrent development of Milestone 3 and Milestone 4 following Milestone 2 approval | Backend and Frontend Teams | Pending |
| Follow the approved milestone branching workflow and task dependencies | All Members | For Compliance |
| Follow Conventional Commits and use the established GitHub templates | All Members | For Compliance |
| Complete remaining milestone deliverables within the established deadlines | Assigned Development Teams | Pending |

**Note:** "Pending" status indicates the task is yet to be initiated.

### V. ADJOURNMENT
The meeting was concluded at 9:24 following discussions on the Milestone 2 Pull Request status, the formalized development and branching workflow, concurrent Milestone 3 and 4 development, individual commit contributions, repository conventions, and the upcoming project deadlines.

### VI. SIGNATORIES
*(Signatures not available in markdown format; please refer to the original PDF)*

**Prepared by:**  
Geryme M. Vega  
*Secretary, SPMIS*  

**Noted by:**  
Norman John Bandibas  
*Team Leader, SPMIS*