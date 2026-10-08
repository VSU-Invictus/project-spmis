/* Extracted from pages/design-system.html */
// Live Light / Dark Mode Toggle Functionality
const toggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const htmlEl = document.documentElement;

function updateThemeUI() {
  const isDark = htmlEl.classList.contains('dark');
  themeIcon.innerHTML = isDark ? '&#127769;' : '&#9728;&#65039;';
  themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
}

toggleBtn.addEventListener('click', () => {
  htmlEl.classList.toggle('dark');
  updateThemeUI();
});

updateThemeUI();


// Auto-resize chat textarea
document.querySelectorAll('.ui-chat-textarea').forEach(textarea => {
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
  // Trigger once on load
  textarea.dispatchEvent(new Event('input'));
});


// Handle Chat Input for Design System
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatPrompt = document.getElementById('chat-prompt');
  const chatLog = document.querySelector('.ui-chat-log');

  if (chatForm && chatPrompt && chatLog) {
    chatPrompt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (chatPrompt.value.trim() !== '') {
          chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    });

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatPrompt.value.trim();
      if (!text) return;

      // Current time
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Create new user message
      const msgDiv = document.createElement('div');
      msgDiv.className = 'ui-chat-msg ui-chat-msg--user';
      
      // Escape HTML
      const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      msgDiv.innerHTML = `
        <div class="ui-chat-msg-content">
          <div class="ui-chat-msg-header">
            <span class="ui-chat-msg-sender">Prof. Morgan</span>
            <span class="ui-chat-msg-time">${timeStr}</span>
          </div>
          <div class="ui-chat-bubble ui-chat-bubble--user">${safeText}</div>
        </div>
      `;
      
      chatLog.appendChild(msgDiv);
      
      // Reset input
      chatPrompt.value = '';
      chatPrompt.style.height = 'auto'; // trigger auto-resize reset
      
      // Scroll to bottom
      chatLog.scrollTop = chatLog.scrollHeight;
    });

    // Prompt cards automatic send
    document.querySelectorAll('.ui-chat-prompt-card[data-prompt]').forEach((card) => {
      const sendCardPrompt = () => {
        const text = card.dataset.prompt;
        if (!text) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ui-chat-msg ui-chat-msg--user';
        const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        msgDiv.innerHTML = `
          <div class="ui-chat-msg-content">
            <div class="ui-chat-msg-header">
              <span class="ui-chat-msg-sender">Prof. Morgan</span>
              <span class="ui-chat-msg-time">${timeStr}</span>
            </div>
            <div class="ui-chat-bubble ui-chat-bubble--user">${safeText}</div>
          </div>
        `;
        chatLog.appendChild(msgDiv);
        chatPrompt.value = '';
        chatPrompt.style.height = 'auto';
        chatLog.scrollTop = chatLog.scrollHeight;
      };
      card.onclick = sendCardPrompt;
      card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sendCardPrompt();
        }
      };
    });
  }
});


// Handle Table Checkboxes
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.ui-table');
  if (!table) return;
  
  const headerCheckbox = table.querySelector('thead input[type="checkbox"]');
  const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
  const paginationText = document.querySelector('.ui-table-pagination span');
  
  function updateTableState() {
    const total = rowCheckboxes.length;
    const checked = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
    
    rowCheckboxes.forEach(cb => {
      const tr = cb.closest('tr');
      if (tr) {
        tr.classList.toggle('checked', cb.checked);
      }
    });
    
    if (checked === 0) {
      headerCheckbox.checked = false;
      headerCheckbox.indeterminate = false;
    } else if (checked === total) {
      headerCheckbox.checked = true;
      headerCheckbox.indeterminate = false;
    } else {
      headerCheckbox.checked = false;
      headerCheckbox.indeterminate = true;
    }
    
    if (paginationText) {
      paginationText.textContent = `${checked} of ${total} row(s) selected.`;
    }
  }
  
  headerCheckbox.addEventListener('change', (e) => {
    rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
    updateTableState();
  });
  
  rowCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateTableState);
    
    const tr = cb.closest('tr');
    if (tr) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('button, a')) {
          return;
        }
        cb.checked = !cb.checked;
        updateTableState();
      });
    }
  });
  
  // Initial state setup
  updateTableState();
});


// Handle Table Static Pagination for Design System Mockups
document.addEventListener('DOMContentLoaded', () => {
  const tableWraps = document.querySelectorAll('.ui-table-wrap');
  tableWraps.forEach(wrap => {
    const select = wrap.querySelector('select.ui-select-pill');
    // Let's also check if the pagination is outside ui-table-wrap, 
    // in some designs the pagination is a sibling to ui-table-wrap.
    // In the design system, ui-table-pagination is typically inside ui-table-wrap or right after it.
    
    // Let's find the pagination container which might be inside wrap or next to it
    let pagination = wrap.querySelector('.ui-table-pagination');
    if (!pagination && wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('ui-table-pagination')) {
        pagination = wrap.nextElementSibling;
    }
    
    if (!pagination) return;
    
    const actualSelect = pagination.querySelector('select.ui-select-pill');
    if (!actualSelect) return;
    
    const tbody = wrap.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const paginationNav = pagination.querySelector('.ui-table-pagination-nav');
    if (!paginationNav) return;
    
    const buttons = paginationNav.querySelectorAll('button');
    const prevBtn = buttons[0];
    const nextBtn = buttons[1];
    
    let currentPage = 1;
    
    function updateView() {
      const limit = parseInt(actualSelect.value) || 5;
      const totalPages = Math.max(1, Math.ceil(rows.length / limit));
      
      if (currentPage > totalPages) currentPage = totalPages;
      
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      
      rows.forEach((row, i) => {
        if (i >= start && i < end) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      const spans = Array.from(pagination.querySelectorAll('span'));
      const pageSpan = spans.find(s => s.textContent.trim().startsWith('Page '));
      if (pageSpan) {
          pageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
      }
      
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }
    
    actualSelect.addEventListener('change', () => {
      currentPage = 1;
      updateView();
    });
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            updateView();
          }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const limit = parseInt(actualSelect.value) || 5;
          const totalPages = Math.ceil(rows.length / limit);
          if (currentPage < totalPages) {
            currentPage++;
            updateView();
          }
        });
    }
    
    // Initial state
    updateView();
  });
});

// Interactive Demo Sidebar Navigation Switcher
document.addEventListener('DOMContentLoaded', () => {
  const demoSidebarNav = document.getElementById('demo-sidebar-nav');
  if (!demoSidebarNav) return;

  demoSidebarNav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    e.preventDefault();

    demoSidebarNav.querySelectorAll('a').forEach((nav) => {
      nav.classList.remove('nav-btn-active');
      nav.classList.add('nav-btn-inactive');
      nav.removeAttribute('aria-current');
    });

    link.classList.remove('nav-btn-inactive');
    link.classList.add('nav-btn-active');
    link.setAttribute('aria-current', 'page');
  });
});

