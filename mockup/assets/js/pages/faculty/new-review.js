/* Extracted from pages/faculty/new-review.html */
/* Local demonstration only. All records are fictional and stored for this tab. */
const $ = (s) => document.querySelector(s);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
const seed = {
  name: "Alex Morgan",
  reviews: [
    {
      id: 1,
      student: "24-1-00001",
      owner: "self",
      author: "Alex Morgan",
      department: "Computer Science",
      body: "Sam developed a clear research plan and supported the team during the robotics project.",
      tags: ["research", "teamwork"],
      status: "active",
      date: "2026-09-03",
      history: [
        {
          date: "2026-09-02",
          body: "Sam developed a clear research plan.",
          tags: ["research"],
        },
      ],
    },
    {
      id: 2,
      student: "24-1-00001",
      owner: "other",
      author: "Jamie Rivera",
      department: "Engineering",
      body: "Sam explained the prototype clearly and helped peers troubleshoot their designs.",
      tags: ["communication", "robotics"],
      status: "active",
      date: "2026-09-04",
      history: [],
    },
    {
      id: 3,
      student: "24-1-00001",
      owner: "self",
      author: "Alex Morgan",
      department: "Computer Science",
      body: "Earlier assessment withdrawn while I reconsider the project context.",
      tags: ["research"],
      status: "hidden",
      date: "2026-08-20",
      history: [],
    },
    {
      id: 4,
      student: "24-1-00002",
      owner: "other",
      author: "Jamie Rivera",
      department: "Engineering",
      body: "Taylor coordinated the robotics team and documented testing carefully.",
      tags: ["robotics", "teamwork"],
      status: "active",
      date: "2026-09-05",
      history: [],
    },
    {
      id: 5,
      student: "24-1-00003",
      owner: "self",
      author: "Alex Morgan",
      department: "Computer Science",
      body: "Jordan contributed thoughtful research notes and communicated findings clearly.",
      tags: ["research", "communication"],
      status: "active",
      date: "2026-09-06",
      history: [],
    },
    {
      id: 6,
      student: "24-1-00004",
      owner: "other",
      author: "Jamie Rivera",
      department: "Engineering",
      body: "Casey supported peers during the workshop.",
      tags: ["teamwork"],
      status: "active",
      date: "2026-09-07",
      history: [],
    },
  ],
  applications: [
    {
      id: 1,
      type: "Student registration",
      name: "Robin Ellis",
      date: "2026-09-02",
      status: "pending",
      reason: "",
    },
    {
      id: 2,
      type: "Program edit",
      name: "BS Computer Science",
      date: "2026-08-30",
      status: "pending",
      reason: "",
    },
    {
      id: 3,
      type: "Department proposal",
      name: "Data Science",
      date: "2026-08-27",
      status: "pending",
      reason: "",
    },
    {
      id: 4,
      type: "Program proposal",
      name: "BS Information Systems",
      date: "2026-08-21",
      status: "approved",
      reason: "",
    },
    {
      id: 5,
      type: "Department proposal",
      name: "Computing Studies",
      date: "2026-08-15",
      status: "rejected",
      reason:
        "An equivalent approved department already exists. Use Computer Science.",
    },
  ],
};
let state;
try {
  state =
    JSON.parse(sessionStorage.getItem("faculty-demo-v1")) ||
    structuredClone(seed);
} catch {
  state = structuredClone(seed);
}
function save() {
  try {
    sessionStorage.setItem("faculty-demo-v1", JSON.stringify(state));
  } catch { }
}
const students = [
  {
    id: "24-1-00001",
    first: "Sam",
    middle: "Lee",
    last: "Parker",
    program: "BS Computer Science",
  },
  {
    id: "24-1-00002",
    first: "Taylor",
    middle: "",
    last: "Reed",
    program: "BS Computer Engineering",
  },
  {
    id: "24-1-00003",
    first: "Jordan",
    middle: "",
    last: "Blake",
    program: "BS Information Systems",
  },
  {
    id: "24-1-00004",
    first: "Casey",
    middle: "",
    last: "Lane",
    program: "BS Computer Science",
  },
  {
    id: "24-1-00005",
    first: "Drew",
    middle: "",
    last: "Hayes",
    program: "BS Information Systems",
  },
  { id: "24-1-00006", first: "Alex", middle: "C", last: "Smith", program: "BS Information Systems" },
  { id: "24-1-00007", first: "Morgan", middle: "", last: "Freeman", program: "BS Computer Science" },
  { id: "24-1-00008", first: "Casey", middle: "D", last: "Jones", program: "BS Computer Engineering" },
  { id: "24-1-00009", first: "Riley", middle: "", last: "O'Neil", program: "BS Computer Science" },
  { id: "24-1-00010", first: "Jamie", middle: "L", last: "Martinez", program: "BS Information Systems" },
  { id: "24-1-00011", first: "Avery", middle: "", last: "Wilson", program: "BS Computer Engineering" },
  { id: "24-1-00012", first: "Quinn", middle: "M", last: "Taylor", program: "BS Computer Science" },
  { id: "24-1-00013", first: "Skyler", middle: "", last: "Brown", program: "BS Information Systems" },
  { id: "24-1-00014", first: "Reese", middle: "T", last: "Davis", program: "BS Computer Engineering" },
  { id: "24-1-00015", first: "Rowan", middle: "", last: "Miller", program: "BS Computer Science" },
  { id: "24-1-00016", first: "Emerson", middle: "J", last: "Moore", program: "BS Information Systems" },
  { id: "24-1-00017", first: "Finley", middle: "", last: "Anderson", program: "BS Computer Engineering" },
  { id: "24-1-00018", first: "Dallas", middle: "R", last: "Thomas", program: "BS Computer Science" },
  { id: "24-1-00019", first: "Dakota", middle: "", last: "Jackson", program: "BS Information Systems" },
  { id: "24-1-00020", first: "Peyton", middle: "S", last: "White", program: "BS Computer Engineering" }
];
const programs = [
  "BS Computer Science",
  "BS Computer Engineering",
  "BS Information Systems",
  "BS Data Science",
  "BS Artificial Intelligence",
  "BS Cybersecurity",
  "BS Software Engineering",
  "BA Digital Media",
  "BS Applied Mathematics",
  "BA Game Design",
  "BS Physics",
  "BS Chemistry",
  "BS Biology"
];
const departments = [
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Data Science",
  "Information Technology",
  "Cybersecurity",
  "Physics",
  "Chemistry",
  "Biology",
  "Digital Arts",
  "Software Engineering",
  "Applied Sciences",
  "Humanities",
  "Business Administration"
];
const getColor = (t) => ({ research: "purple", robotics: "rose", teamwork: "amber", communication: "cyan", algorithms: "cyan", leadership: "amber" }[t.toLowerCase()] || "neutral");
const full = (s) =>
  `${s.first} ${s.middle ? s.middle + " " : ""}${s.last}`;
const badge = (s) => `<span class="ui-badge ui-badge--${s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'destructive' : 'neutral'}">${esc(s[0].toUpperCase() + s.slice(1))}</span>`;
document
  .querySelectorAll("[data-name]")
  .forEach((e) => (e.textContent = state.name));
const page = document.body.dataset.page;
function localDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
function appRows(items) {
  return items
    .map(
      (a) =>
        `<tr><td>${esc(a.type)}</td><td>${esc(a.name)}</td><td>${esc(a.date)}</td><td>${badge(a.status)}</td><td>${esc(a.reason || (a.status === "pending" ? "Awaiting admin review" : "Approved by admin"))}</td></tr>`,
    )
    .join("");
}
function appTable(items) {
  return items.length
    ? `<div class="table-wrap"><table><thead><tr><th>Application type</th><th>Requested record</th><th>Submitted</th><th>Status</th><th>Decision / reason</th></tr></thead><tbody>${appRows(items)}</tbody></table></div>`
    : '<div class="empty">No applications match this view.</div>';
}
function addApplication(type, name, payload) {
  state.applications.unshift({
    id: Date.now(),
    type,
    name,
    payload,
    date: localDate(),
    status: "pending",
    reason: "",
  });
  save();
}
if (page === "dashboard") {
  $("#student-count").textContent = students.length;
  $("#review-count").textContent = state.reviews.filter(
    (r) => r.owner === "self" && r.status !== "deleted",
  ).length;
  $("#pending-count").textContent = state.applications.filter(
    (a) => a.status === "pending",
  ).length;
  $("#pending-applications").innerHTML = appTable(
    state.applications.filter((a) => a.status === "pending"),
  );
}
if (page === "students") {
  let current = 1,
    timer;
  const size = 3;
  function render() {
    const mode = $("#roster-state").value;
    if (mode === "loading") {
      $("#roster-results").innerHTML =
        '<div role="status" aria-label="Loading students"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';
      $("#page-label").textContent = "Loading students…";
      $("#previous").disabled = $("#next").disabled = true;
      return;
    }
    const search = $("#search").value.trim().toLowerCase(),
      dept = $("#department").value,
      tag = $("#tag").value,
      owner = $("#owner").value;
    const matches =
      mode === "empty"
        ? []
        : students.filter((s) => {
          const reviews = state.reviews.filter(
            (r) => r.student === s.id && r.status === "active",
          );
          if (
            !dept &&
            !tag &&
            !owner &&
            (!search ||
              full(s).toLowerCase().includes(search) ||
              s.id.toLowerCase().includes(search))
          )
            return true;
          return reviews.some(
            (r) =>
              (!dept || r.department === dept) &&
              (!tag || r.tags.includes(tag)) &&
              (!owner || r.owner === owner) &&
              (!search ||
                r.body.toLowerCase().includes(search) ||
                full(s).toLowerCase().includes(search) ||
                s.id.toLowerCase().includes(search)),
          );
        });
    const total = Math.max(1, Math.ceil(matches.length / size));
    current = Math.min(current, total);
    $("#roster-results").innerHTML = matches.length
      ? `<div class="table-wrap"><table><thead><tr><th>Student ID</th><th>Student</th><th>Program</th><th>Visible review tags</th><th>Action</th></tr></thead><tbody>${matches
        .slice((current - 1) * size, current * size)
        .map(
          (s) =>
            `<tr><td>${s.id}</td><td><a href="student-detail.html?id=${s.id}">${esc(full(s))}</a></td><td>${s.program}</td><td>${[...new Set(state.reviews.filter((r) => r.student === s.id && r.status === "active").flatMap((r) => r.tags))].map((t) => `<span class="ui-badge ui-badge--${getColor(t)}">${esc(t)}</span>`).join(" ") || "No active reviews"}</td><td><a href="new-review.html?id=${s.id}">Write review</a></td></tr>`,
        )
        .join("")}</tbody></table></div>`
      : '<div class="card empty"><h2>No matching students</h2><p>Try another review keyword or clear your filters.</p><button class="secondary" id="empty-clear">Clear filters</button></div>';
    $("#page-label").textContent = matches.length
      ? `Page ${current} of ${total} · ${matches.length} students`
      : "0 students";
    $("#previous").disabled = current === 1;
    $("#next").disabled = current === total;
    if ($("#empty-clear")) $("#empty-clear").onclick = clear;
  }
  function clear() {
    document
      .querySelectorAll(".filters input,.filters select")
      .forEach((e) => (e.value = ""));
    $("#roster-state").value = "ready";
    current = 1;
    render();
  }
  $("#clear-filters").onclick = clear;
  document
    .querySelectorAll(".filters input,.filters select")
    .forEach((e) =>
      e.addEventListener("input", () => {
        clearTimeout(timer);
        current = 1;
        $("#roster-results").innerHTML =
          '<div role="status" aria-label="Loading students"><div class="skeleton"></div><div class="skeleton"></div></div>';
        timer = setTimeout(render, 300);
      }),
    );
  $("#roster-state").onchange = () => {
    clearTimeout(timer);
    current = 1;
    render();
  };
  $("#previous").onclick = () => {
    current--;
    render();
  };
  $("#next").onclick = () => {
    current++;
    render();
  };
  const tags = [
    ...new Set(
      state.reviews
        .filter((r) => r.status === "active")
        .flatMap((r) => r.tags),
    ),
  ];
  $("#tag").innerHTML =
    '<option value="">All tags</option>' +
    tags.map((t) => `<option>${esc(t)}</option>`).join("");
  render();
}
const selected =
  students.find(
    (s) => s.id === new URLSearchParams(location.search).get("id"),
  ) || (!location.search ? students[0] : null);
if (page === "student-detail" || page === "new-review") {
  if (!selected) {
    $("main").innerHTML =
      '<h1>Student not found</h1><p>This sample student record is unavailable.</p><a class="button" href="students.html">Back to students</a>';
  } else {
    document
      .querySelectorAll("[data-student-name]")
      .forEach((e) => (e.textContent = full(selected)));
    document
      .querySelectorAll("[data-student-id]")
      .forEach((e) => (e.textContent = selected.id));
    document
      .querySelectorAll("[data-student-program]")
      .forEach((e) => (e.textContent = selected.program));
    document
      .querySelectorAll("[data-student-link]")
      .forEach((e) => (e.href = "student-detail.html?id=" + selected.id));
    let attachedFiles = [];
    if (page === "new-review")
      $("#review-form").onsubmit = (e) => {
        e.preventDefault();
        const editor = document.getElementById("review-editor");
        const reviewText = document.getElementById("review-text");
        const plainText = editor ? editor.innerText.trim() : (reviewText ? reviewText.value.trim() : "");
        if (!plainText) {
          if (editor) editor.focus();
          if (reviewText) {
            reviewText.setCustomValidity("Enter a review before saving.");
            reviewText.reportValidity();
          }
          return;
        }
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        if (wordCount > 500) {
          if (editor) editor.focus();
          if (reviewText) {
            reviewText.setCustomValidity("Review exceeds the 500 word limit.");
            reviewText.reportValidity();
          }
          return;
        }
        const body = editor ? editor.innerHTML : plainText;
        state.reviews.unshift({
          id: Date.now(),
          student: selected.id,
          owner: "self",
          author: state.name,
          department: "Computer Science",
          body,
          tags: normalizeTags($("#review-tags").value),
          attachments: attachedFiles ? attachedFiles.map((f) => f.name) : [],
          status: "active",
          date: localDate(),
          history: [],
        });
        save();
        location.href = "student-detail.html?id=" + selected.id;
      };
    if (page === "new-review") {
      const editor = document.getElementById("review-editor");
      const reviewText = document.getElementById("review-text");

      function isEditorEmpty() {
        if (!editor) return true;
        if (editor.querySelector("ul, ol, li, blockquote, table, img")) {
          return false;
        }
        const text = editor.innerText.replace(/[\n\r\t\u200B-\u200D\uFEFF]/g, "").trim();
        if (text.length > 0) {
          return false;
        }
        const html = editor.innerHTML.trim();
        return !html || html === "<br>" || html === "<div><br></div>" || html === "<p><br></p>";
      }

      function syncEditorContent() {
        if (!editor) return;
        const plain = editor.innerText.trim();
        const html = editor.innerHTML;
        const empty = isEditorEmpty();
        if (empty) {
          editor.dataset.empty = "true";
          if (reviewText) reviewText.value = "";
        } else {
          delete editor.dataset.empty;
          if (reviewText) reviewText.value = html;
        }
        if (reviewText) reviewText.setCustomValidity("");
        updateWordCounter(plain);
      }

      function updateWordCounter(text) {
        const cleanText = (typeof text === "string" ? text : (editor ? editor.innerText : "")).trim();
        const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
        const chars = cleanText.length;
        const counter = document.getElementById("review-limit-counter");
        if (counter) {
          const isOver = words > 500;
          counter.innerHTML = `<span class="${isOver ? 'word-count-over' : ''}">${words} / 500 words</span> <span class="is-bf2bcce">(${chars} chars)</span>`;
        }
        return { words, chars };
      }

      function updateToolbarActiveState() {
        document.querySelectorAll(".toolbar-btn[data-format]").forEach(btn => {
          const format = btn.dataset.format;
          let isActive = false;
          try {
            if (format === "bold") isActive = document.queryCommandState("bold");
            else if (format === "italic") isActive = document.queryCommandState("italic");
            else if (format === "bullet") isActive = document.queryCommandState("insertUnorderedList");
            else if (format === "number") isActive = document.queryCommandState("insertOrderedList");
          } catch (_) {}
          if (isActive) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });
      }

      function renderRichText(text) {
        if (!text) return "";
        if (/<(strong|b|em|i|ul|ol|li|p|br|div)[\s>]/i.test(text)) {
          return text;
        }
        let safe = esc(text);
        safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        safe = safe.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
        const lines = safe.split(/\r?\n/);
        let inUl = false;
        let inOl = false;
        const result = [];
        for (const line of lines) {
          const ulMatch = line.match(/^[-*]\s+(.*)$/);
          const olMatch = line.match(/^\d+\.\s+(.*)$/);
          if (ulMatch) {
            if (inOl) { result.push("</ol>"); inOl = false; }
            if (!inUl) { result.push("<ul class='is-0600237'>"); inUl = true; }
            result.push(`<li>${ulMatch[1]}</li>`);
          } else if (olMatch) {
            if (inUl) { result.push("</ul>"); inUl = false; }
            if (!inOl) { result.push("<ol class='is-0600237'>"); inOl = true; }
            result.push(`<li>${olMatch[1]}</li>`);
          } else {
            if (inUl) { result.push("</ul>"); inUl = false; }
            if (inOl) { result.push("</ol>"); inOl = false; }
            result.push(line);
          }
        }
        if (inUl) result.push("</ul>");
        if (inOl) result.push("</ol>");
        return result.join("<br>");
      }

      if (editor) {
        editor.addEventListener("input", syncEditorContent);
        editor.addEventListener("keyup", updateToolbarActiveState);
        editor.addEventListener("mouseup", updateToolbarActiveState);
        editor.addEventListener("focus", updateToolbarActiveState);
        syncEditorContent();
      }

      document.querySelectorAll(".toolbar-btn[data-format]").forEach(btn => {
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
        });
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const format = btn.dataset.format;
          if (!format || !editor) return;
          editor.focus();
          if (format === "bold") {
            document.execCommand("bold", false, null);
          } else if (format === "italic") {
            document.execCommand("italic", false, null);
          } else if (format === "bullet") {
            document.execCommand("insertUnorderedList", false, null);
          } else if (format === "number") {
            document.execCommand("insertOrderedList", false, null);
          }
          updateToolbarActiveState();
          syncEditorContent();
        });
      });

      const attachmentInput = document.getElementById("review-attachment-input");
      const attachmentStatus = document.getElementById("attachment-status");
      const attachmentChips = document.getElementById("attachment-chips");
      const attachmentClearBtn = document.getElementById("attachment-clear-btn");
      const toolbarAttachBtn = document.getElementById("toolbar-attach-btn");

      if (toolbarAttachBtn && attachmentInput) {
        toolbarAttachBtn.addEventListener("click", () => {
          attachmentInput.click();
        });
      }

      function updateAttachmentDisplay() {
        const attachmentContainer = document.getElementById("attachment-container");
        if (!attachmentChips || !attachmentStatus) return;
        if (attachedFiles.length === 0) {
          attachmentStatus.textContent = "No files chosen";
          attachmentChips.innerHTML = "";
          if (attachmentClearBtn) attachmentClearBtn.style.display = "none";
          if (attachmentContainer) attachmentContainer.style.display = "none";
          if (attachmentInput) attachmentInput.value = "";
          if (toolbarAttachBtn) {
            toolbarAttachBtn.classList.remove("active");
            toolbarAttachBtn.title = "Attach files";
          }
        } else {
          attachmentStatus.textContent = `${attachedFiles.length} file${attachedFiles.length > 1 ? "s" : ""} attached`;
          if (attachmentClearBtn) attachmentClearBtn.style.display = "inline-block";
          if (attachmentContainer) attachmentContainer.style.display = "block";
          if (toolbarAttachBtn) {
            toolbarAttachBtn.classList.add("active");
            toolbarAttachBtn.title = `${attachedFiles.length} file${attachedFiles.length > 1 ? "s" : ""} attached (click to add more)`;
          }
          attachmentChips.innerHTML = attachedFiles.map((f, idx) => `
            <span class="ui-badge ui-badge--neutral is-129ba2b">
              <span>📄 ${esc(f.name)} <small class="is-bf2bcce">(${(f.size / 1024).toFixed(1)} KB)</small></span>
              <button class="is-7cadf1c" type="button" data-remove-attachment="${idx}" aria-label="Remove attachment ${esc(f.name)}" title="Remove file">&times;</button>
            </span>
          `).join("");

          attachmentChips.querySelectorAll("[data-remove-attachment]").forEach(btn => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              removeAttachment(Number(btn.dataset.removeAttachment));
            });
          });
        }

        if (attachmentInput && window.DataTransfer) {
          const dt = new DataTransfer();
          attachedFiles.forEach(f => dt.items.add(f));
          attachmentInput.files = dt.files;
        }
      }

      function removeAttachment(index) {
        if (index >= 0 && index < attachedFiles.length) {
          attachedFiles.splice(index, 1);
          updateAttachmentDisplay();
        }
      }

      if (attachmentClearBtn) {
        attachmentClearBtn.addEventListener("click", (e) => {
          e.preventDefault();
          attachedFiles = [];
          updateAttachmentDisplay();
        });
      }

      if (attachmentInput) {
        attachmentInput.addEventListener("change", () => {
          const newFiles = Array.from(attachmentInput.files || []);
          newFiles.forEach(newFile => {
            if (!attachedFiles.some(f => f.name === newFile.name && f.size === newFile.size)) {
              attachedFiles.push(newFile);
            }
          });
          updateAttachmentDisplay();
        });
      }

      // Tag autocomplete logic - strictly comma-separated
      const tagInput = document.getElementById("tag-input");
      const tagSuggestions = document.getElementById("tag-suggestions");
      const tagInputBox = document.getElementById("tag-input-box");
      const hiddenTagsInput = document.getElementById("review-tags");
      const allKnownTags = Array.from(new Set([
        "research", "teamwork", "communication", "robotics", "algorithms", "leadership", "mentorship",
        ...state.reviews.flatMap(r => r.tags || [])
      ])).filter(Boolean);

      let currentTags = [];

      function addTags(rawText) {
        if (!rawText) return;
        const parts = rawText
          .split(",")
          .map(p => p.trim().toLowerCase().replace(/[^a-z0-9- ]/g, "").replace(/\s+/g, " "))
          .filter(Boolean);

        parts.forEach(tag => {
          if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
          }
        });

        if (hiddenTagsInput) hiddenTagsInput.value = currentTags.join(", ");
        renderTagChips();
        if (tagInput) {
          tagInput.value = "";
        }
        if (tagSuggestions) tagSuggestions.style.display = "none";
      }

      function removeTag(tagToRemove) {
        currentTags = currentTags.filter(t => t !== tagToRemove);
        if (hiddenTagsInput) hiddenTagsInput.value = currentTags.join(", ");
        renderTagChips();
        if (tagInput) tagInput.focus();
      }

      function renderTagChips() {
        const list = document.getElementById("tag-chips-list");
        if (!list) return;
        list.innerHTML = currentTags.map(t => `
          <span class="ui-badge ui-badge--${getColor(t)} is-b1d22f2">
            <span>#${esc(t)}</span>
            <button class="is-2fe8d90" type="button" data-remove-tag="${esc(t)}" aria-label="Remove tag ${esc(t)}" title="Remove tag">&times;</button>
          </span>
        `).join("");

        list.querySelectorAll("[data-remove-tag]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeTag(btn.dataset.removeTag);
          });
        });
      }

      function showSuggestions(filterText = "") {
        const query = filterText.trim().toLowerCase();
        const filtered = allKnownTags.filter(t => !currentTags.includes(t) && (!query || t.toLowerCase().includes(query)));
        if (!tagSuggestions) return;

        let html = "";
        if (filtered.length > 0) {
          html += `<div class="is-5843655">Suggested tags</div>`;
          filtered.forEach(t => {
            html += `<div class="tag-suggestion-item is-ef25cc2" data-tag="${esc(t)}">
              <span>#${esc(t)}</span>
              <span class="ui-badge ui-badge--${getColor(t)} is-5d76595">suggested</span>
            </div>`;
          });
        }
        if (query && !allKnownTags.includes(query) && !currentTags.includes(query)) {
          html += `<div class="tag-suggestion-item is-ef283f5" data-tag="${esc(query)}">
            + Create new tag "<strong>${esc(query)}</strong>"
          </div>`;
        }

        if (html) {
          tagSuggestions.innerHTML = html;
          tagSuggestions.style.display = "block";
          tagSuggestions.querySelectorAll(".tag-suggestion-item").forEach(item => {
            item.addEventListener("mouseenter", () => {
              item.style.backgroundColor = "color-mix(in srgb, var(--primary) 12%, var(--card))";
            });
            item.addEventListener("mouseleave", () => {
              item.style.backgroundColor = "transparent";
            });
            item.addEventListener("mousedown", (e) => {
              e.preventDefault();
              addTags(item.dataset.tag);
            });
          });
        } else {
          tagSuggestions.style.display = "none";
        }
      }

      if (tagInput && tagSuggestions) {
        tagInput.addEventListener("input", () => {
          if (tagInput.value.includes(",")) {
            const parts = tagInput.value.split(",");
            const remainder = parts.pop();
            parts.forEach(p => addTags(p));
            tagInput.value = remainder;
          }
          showSuggestions(tagInput.value);
        });
        tagInput.addEventListener("paste", () => {
          setTimeout(() => {
            if (tagInput.value.includes(",")) {
              const parts = tagInput.value.split(",");
              const remainder = parts.pop();
              parts.forEach(p => addTags(p));
              tagInput.value = remainder;
              showSuggestions(tagInput.value);
            }
          }, 0);
        });
        tagInput.addEventListener("focus", () => showSuggestions(tagInput.value));
        tagInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === ",") {
            if (tagInput.value.trim()) {
              e.preventDefault();
              addTags(tagInput.value);
            }
          } else if (e.key === "Backspace" && !tagInput.value && currentTags.length > 0) {
            removeTag(currentTags[currentTags.length - 1]);
          } else if (e.key === "Escape") {
            tagSuggestions.style.display = "none";
          }
        });

        if (tagInputBox) {
          tagInputBox.addEventListener("click", () => tagInput.focus());
        }
        document.addEventListener("click", (e) => {
          if (tagInputBox && !tagInputBox.contains(e.target) && !tagSuggestions.contains(e.target)) {
            tagSuggestions.style.display = "none";
          }
        });
      }
    }
    if (page === "student-detail") {
      $("#new-review-link").href = "new-review.html?id=" + selected.id;
      function renderReviews() {
        const visible = state.reviews.filter(
          (r) =>
            r.student === selected.id &&
            (r.status === "active" ||
              (r.status === "hidden" && r.owner === "self")),
        );
        $("#reviews").innerHTML =
          visible
            .map(
              (r) =>
                `<article class="card review ${r.status === "hidden" ? "hidden-review" : ""}"><div class="between"><div><h3>${esc(r.owner === "self" ? state.name : r.author)} ${r.owner === "self" ? "· You" : ""}</h3><small>${esc(r.department)} · ${esc(r.date)}</small></div>${r.status === "hidden" ? '<span class="ui-badge ui-badge--neutral">Hidden · Only you</span>' : '<span class="ui-badge ui-badge--success">Active</span>'}</div><div class="review-body">${renderRichText(r.body)}</div><div>${r.tags.map((t) => `<span class="ui-badge ui-badge--${getColor(t)}">${esc(t)}</span>`).join("")}</div><details><summary>Edit history (${r.history.length})</summary>${r.history.length ? r.history.map((h) => `<p><small>Previous version · ${esc(h.date)}</small></p><div class="review-body">${renderRichText(h.body)}</div><p class="muted">Tags: ${esc(h.tags.join(", ") || "None")}</p>`).join("") : '<p class="muted">This review has not been edited.</p>'}</details>${r.owner === "self" ? `<div class="actions is-82e88f3"><button class="secondary" data-edit="${r.id}">Edit</button><button class="secondary" data-toggle="${r.id}">${r.status === "hidden" ? "Unhide" : "Hide"}</button><button class="secondary" data-delete="${r.id}">Delete</button></div>` : ""}</article>`,
            )
            .join("") ||
          '<div class="card empty">No visible reviews yet. Be the first to write one.</div>';
      }
      let editing, deleting;
      $("#reviews").onclick = (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.toggle) {
          const r = state.reviews.find(
            (r) =>
              r.id === Number(b.dataset.toggle) && r.owner === "self",
          );
          if (r) {
            r.status = r.status === "active" ? "hidden" : "active";
            save();
            renderReviews();
          }
        }
        if (b.dataset.edit) {
          editing = state.reviews.find(
            (r) => r.id === Number(b.dataset.edit) && r.owner === "self",
          );
          if (editing) {
            $("#edit-body").value = editing.body;
            $("#edit-tags").value = editing.tags.join(", ");
            $("#edit-dialog").showModal();
          }
        }
        if (b.dataset.delete) {
          deleting = Number(b.dataset.delete);
          $("#delete-dialog").showModal();
        }
      };
      $("#edit-form").onsubmit = (e) => {
        e.preventDefault();
        if (!$("#edit-body").value.trim()) {
          $("#edit-body").setCustomValidity("Enter review text.");
          $("#edit-body").reportValidity();
          return;
        }
        editing.history.unshift({
          date: editing.date,
          body: editing.body,
          tags: [...editing.tags],
        });
        editing.body = $("#edit-body").value.trim();
        editing.tags = normalizeTags($("#edit-tags").value);
        editing.date = localDate();
        save();
        $("#edit-dialog").close();
        renderReviews();
      };
      $("#edit-body").oninput = () =>
        $("#edit-body").setCustomValidity("");
      $("#confirm-delete").onclick = () => {
        const r = state.reviews.find(
          (r) => r.id === deleting && r.owner === "self",
        );
        if (r) r.status = "deleted";
        save();
        $("#delete-dialog").close();
        renderReviews();
      };
      renderReviews();
    }
  }
}
function normalizeTags(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "string") return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}
if (page === "register-student") {
  $("#program").innerHTML = programs
    .map((p) => `<option>${p}</option>`)
    .join("");
  $("#registration-form").onsubmit = (e) => {
    e.preventDefault();
    const fields = ["student-id", "first-name", "last-name"];
    if (fields.some((id) => !$("#" + id).value.trim())) {
      $("#registration-status").textContent =
        "Enter the required student ID, first name, and last name.";
      return;
    }
    const id = $("#student-id").value.trim();
    if (
      students.some((s) => s.id.toLowerCase() === id.toLowerCase()) ||
      state.applications.some(
        (a) =>
          a.type === "Student registration" &&
          a.status === "pending" &&
          a.payload?.id?.toLowerCase() === id.toLowerCase(),
      )
    ) {
      $("#registration-status").textContent =
        "This student ID already exists or has a pending registration.";
      return;
    }
    const payload = {
      id,
      first: $("#first-name").value.trim(),
      middle: $("#middle-name").value.trim(),
      last: $("#last-name").value.trim(),
      program: $("#program").value,
    };
    addApplication("Student registration", full(payload), payload);
    $("#registration-form").hidden = true;
    $("#registration-success").hidden = false;
  };
}
if (page === "applications") {
  const render = () => {
    $("#application-list").innerHTML = appTable(
      state.applications.filter(
        (a) =>
          (!$("#application-status").value ||
            a.status === $("#application-status").value) &&
          `${a.name} ${a.type}`
            .toLowerCase()
            .includes($("#application-search").value.toLowerCase()),
      ),
    );
  };
  $("#application-status").onchange = render;
  $("#application-search").oninput = render;
  render();
}
if (page === "programs" || page === "departments") {
  const isProgram = page === "programs",
    list = isProgram ? programs : departments;
  let original = "";
  function render() {
    const filtered = list.filter((p) =>
      p.toLowerCase().includes($("#entity-search").value.toLowerCase()),
    );
    $("#entity-list").innerHTML = filtered.length
      ? `<div class="table-wrap"><table><thead><tr><th>${isProgram ? "Program" : "Department"}</th><th>Status</th>${isProgram ? "<th>Action</th>" : ""}</tr></thead><tbody>${filtered.map((p) => `<tr><td>${esc(p)}</td><td>${badge("approved")}</td>${isProgram ? `<td><button type="button" class="ui-btn ui-btn-outline" data-propose-edit="${esc(p)}">Apply to edit</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`
      : '<p class="empty">No matching entries. Try another name.</p>';
  }
  $("#entity-search").oninput = render;
  function open(name = "") {
    original = name;
    $("#proposal-title").textContent = name
      ? "Apply to edit program"
      : `Propose a ${isProgram ? "program" : "department"}`;
    $("#entity-name").value = name;
    $("#entity-name").setCustomValidity("");
    $("#proposal-dialog").showModal();
  }
  $("#add-entity").onclick = () => open();
  $("#entity-list").onclick = (e) => {
    const b = e.target.closest("[data-propose-edit]");
    if (b) open(b.dataset.proposeEdit);
  };
  $("#proposal-form").onsubmit = (e) => {
    e.preventDefault();
    const name = $("#entity-name").value.trim();
    if (
      !name ||
      name === original ||
      list.some(
        (p) => p.toLowerCase() === name.toLowerCase() && p !== original,
      )
    ) {
      $("#entity-name").setCustomValidity(
        "Enter a new, distinct name for this proposal.",
      );
      $("#entity-name").reportValidity();
      return;
    }
    addApplication(
      isProgram
        ? original
          ? "Program edit"
          : "Program proposal"
        : "Department proposal",
      original ? `${original} <span class="arrow">&rarr;</span> ${name}` : name,
      { original, name },
    );
    $("#proposal-dialog").close();
    $("#proposal-status").textContent =
      "Application submitted. The approved list stays unchanged until an admin approves your proposal.";
  };
  $("#entity-name").oninput = () =>
    $("#entity-name").setCustomValidity("");
  render();
}
if (page === "profile") {
  $("#full-name").value = state.name;
  $("#profile-form").onsubmit = (e) => {
    e.preventDefault();
    if (!$("#full-name").value.trim()) {
      $("#full-name").setCustomValidity("Enter your name.");
      $("#full-name").reportValidity();
      return;
    }
    state.name = $("#full-name").value.trim();
    save();
    document
      .querySelectorAll("[data-name]")
      .forEach((e) => (e.textContent = state.name));
    $("#profile-status").textContent =
      "Profile saved for this demo session.";
  };
  $("#full-name").oninput = () => $("#full-name").setCustomValidity("");
}
if (page === "chat") {
  let busy = false,
    lastPrompt = "";
  function message(role, body) {
    const item = document.createElement("div");
    item.className = "message " + (role === "You" ? "user" : "");
    const title = document.createElement("strong");
    title.textContent = role;
    item.append(title, document.createTextNode(body));
    $("#chat-log").append(item);
    $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  }
  function generate() {
    busy = true;
    $("#send").disabled = true;
    $("#retry-panel").hidden = true;
    $("#generating").hidden = false;
    setTimeout(() => {
      busy = false;
      $("#send").disabled = false;
      $("#generating").hidden = true;
      if ($("#chat-mode").value === "limited") {
        $("#retry-panel").hidden = false;
        return;
      }
      const active = state.reviews.filter((r) => r.status === "active");
      const terms = lastPrompt
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);
      const relevant = active.filter((r) =>
        terms.some((t) =>
          (r.body + " " + r.tags.join(" ")).toLowerCase().includes(t),
        ),
      );
      const sample = (relevant.length ? relevant : active).slice(0, 3);
      message(
        "AI assistant · Sample response",
        sample.length
          ? "For this mockup, here are active review excerpts" +
          (relevant.length
            ? " matching words in your question"
            : "; no direct keyword match was found") +
          ":\n\n" +
          sample
            .map(
              (r) =>
                `${full(students.find((s) => s.id === r.student))} — ${r.body}\nContributor: ${r.owner === "self" ? state.name : r.author}`,
            )
            .join("\n\n") +
          "\n\nThese are attributed faculty opinions. Open the student record to review the full context."
          : "There are no active reviews available to reference.",
      );
    }, 800);
  }
  $("#chat-form").onsubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    const prompt = $("#chat-prompt").value.trim();
    if (!prompt) return;
    lastPrompt = prompt;
    message("You", prompt);
    $("#chat-prompt").value = "";
    generate();
  };
  $("#retry").onclick = () => {
    if (!busy) generate();
  };
}
document
  .querySelectorAll("[data-close]")
  .forEach((b) => (b.onclick = () => b.closest("dialog").close()));

// Presentation controls remain local to this self-contained mockup.
function paginateTable(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  const controls = document.createElement("div");
  controls.className = "ui-table-pagination";
  controls.style.cssText = "border-top: none; padding: 1rem 0; display: flex; justify-content: space-between; background: transparent; align-items: center; flex-wrap: wrap; gap: 1rem;";
  controls.innerHTML =
    '<div class="is-78465d4"><span class="is-7fbae58"></span><div class="is-31de0eb"><div class="is-b57eafe"><span>Rows per page</span><div class="is-e0dd7f8"><select class="ui-select-pill is-daab64f" aria-label="Rows per page"><option value="5" selected>5</option><option value="10">10</option><option value="20">20</option></select><svg class="is-4b97db6" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div></div><span class="is-12b4142" role="status"></span><div class="ui-table-pagination-nav is-49e15c7"><button class="ui-btn ui-btn-outline is-b38e363" type="button">Previous</button><button class="ui-btn ui-btn-outline is-b38e363" type="button">Next</button></div></div></div>';
  host.after(controls);
  let current = 1;
  const size = controls.querySelector("select"),
    buttons = controls.querySelectorAll("button"),
    info = controls.querySelector("[role=status]");
  function update() {
    const rows = [...host.querySelectorAll("tbody tr")],
      limit = Number(size.value),
      pages = Math.max(1, Math.ceil(rows.length / limit));
    current = Math.min(current, pages);
    rows.forEach(
      (row, i) =>
        (row.hidden = i < (current - 1) * limit || i >= current * limit),
    );
    info.textContent =
      "Page " +
      current +
      " of " +
      pages +
      " · " +
      rows.length +
      " entries";
    buttons[0].disabled = current === 1;
    buttons[1].disabled = current === pages;
  }
  buttons[0].onclick = () => {
    current--;
    update();
  };
  buttons[1].onclick = () => {
    current++;
    update();
  };
  size.onchange = () => {
    current = 1;
    update();
  };
  new MutationObserver(() => {
    current = 1;
    update();
  }).observe(host, { childList: true });
  update();
}
if (page === "applications") paginateTable("application-list");
if (page === "programs" || page === "departments")
  paginateTable("entity-list");
if (page === "dashboard") {
  const quick = document.querySelector(".quick-links").closest("section"),
    pending = document
      .getElementById("pending-applications")
      .closest("section");
  const panels = document.createElement("div");
  panels.className = "dashboard-panels";
  quick.before(panels);
  pending.classList.add("card");
  panels.append(quick, pending);
  const stat = document.createElement("div");
  stat.className = "card stat";
  stat.innerHTML =
    '<span class="muted">Programs</span><strong>' +
    programs.length +
    "</strong><small>Approved programs</small>";
  document.querySelector(".stats").append(stat);
  document.getElementById("pending-applications").innerHTML =
    state.applications
      .filter((a) => a.status === "pending")
      .slice(0, 3)
      .map(
        (a) =>
          '<div class="pending-item"><div><strong>' +
          esc(a.type) +
          " · " +
          esc(a.name) +
          "</strong><small>Submitted " +
          esc(a.date) +
          "</small></div>" +
          badge(a.status) +
          "</div>",
      )
      .join("") || "<p>No pending applications.</p>";
}
if (page === "chat") {
  document.querySelectorAll("[data-prompt]").forEach(
    (b) =>
    (b.onclick = () => {
      document.getElementById("chat-prompt").value = b.dataset.prompt;
      document.getElementById("chat-prompt").focus();
    }),
  );
}


   /* The shared HTML is authoritative when served over HTTP. The inline sidebar
keeps navigation available when opening the mockup directly from disk. */
   (() => {
     const componentUrl = new URL(
       "../../components/navigation/sidebar-faculty.html",
       document.baseURI,
     );
     const host = document.querySelector("[data-faculty-sidebar]");
     if (!host) return;

     function markCurrent() {
       const page = document.body.dataset.page;
       const current = [
         "student-detail",
         "register-student",
         "new-review",
       ].includes(page)
         ? "students"
         : page;
       host.querySelectorAll("a[href]").forEach((link) => {
         const target = new URL(
           link.getAttribute("href"),
           location.href,
         ).pathname
           .split("/")
           .pop();
         if (
           target === `${current}.html` &&
           !link.classList.contains("brand")
         ) {
           link.setAttribute("aria-current", "page");
         } else {
           link.removeAttribute("aria-current");
         }
       });
     }

     markCurrent();
     if (location.protocol === "file:") return;
     fetch(componentUrl)
       .then((response) => {
         if (!response.ok)
           throw new Error(`Sidebar request failed: ${response.status}`);
         return response.text();
       })
       .then((html) => {
         const template = document.createElement("template");
         template.innerHTML = html;
         const sidebar = template.content.querySelector("aside");
         if (!sidebar)
           throw new Error(
             "Sidebar component is missing its aside element.",
           );
         const name = host.querySelector("[data-name]")?.textContent;
         host.replaceChildren(...sidebar.childNodes);
         if (name)
           host.querySelectorAll("[data-name]").forEach((element) => {
             element.textContent = name;
           });
         markCurrent();
       })
       .catch((error) => {
         console.warn("Using the local faculty navigation fallback.", error);
       });
   })();
