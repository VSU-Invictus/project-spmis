const fs = require('fs');
const path = require('path');

const adminPages = [
  'students.html',
  'departments.html',
  'programs.html',
  'faculty.html',
  'audit-log.html',
  'student-applications.html',
  'department-applications.html',
  'program-applications.html',
  'faculty-applications.html'
];

let totalErrors = 0;

adminPages.forEach(page => {
  const file = path.join('mockup', 'pages', 'admin', page);
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n=== Checking: ${page} ===`);

  const isTable = content.includes('<table');
  const isFlex = content.includes('table-header-row');
  console.log('Type:', isTable ? 'HTML table' : (isFlex ? 'Flex div table' : 'UNKNOWN'));
  const hasScroll = content.includes('table-scroll');
  console.log('Has table-scroll:', hasScroll);
  if (!hasScroll) {
    console.error(`  ERROR: ${page} is missing table-scroll wrapper!`);
    totalErrors++;
  }

  const hasPagination = content.includes('ui-table-pagination');
  console.log('Has ui-table-pagination:', hasPagination);
  if (!hasPagination) {
    console.error(`  ERROR: ${page} is missing ui-table-pagination!`);
    totalErrors++;
  }

  if (isFlex) {
    const headerStart = content.indexOf('<div class="table-header-row">');
    const bodyStart = content.indexOf('class="table-body"', headerStart);
    const altBodyStart = content.indexOf('class="table-body', headerStart);
    const actualBodyStart = bodyStart !== -1 ? bodyStart : altBodyStart;

    const headerChunk = content.substring(headerStart, actualBodyStart);
    const thCells = [...headerChunk.matchAll(/<div class="th-cell([^"]*)">/g)].map(m => m[1].trim());
    console.log(`Header cell count: ${thCells.length}`, thCells);

    // Split body by table-row
    const bodyEnd = content.indexOf('</div>\n        </div>\n\n        <div class="ui-table-pagination', actualBodyStart);
    const altBodyEnd = content.indexOf('ui-table-pagination', actualBodyStart);
    const actualBodyEnd = bodyEnd !== -1 ? bodyEnd : altBodyEnd;
    const bodyChunk = content.substring(actualBodyStart, actualBodyEnd);

    const rowChunks = bodyChunk.split(/<div class="table-row"[^>]*>/).slice(1);
    console.log(`Rows found: ${rowChunks.length}`);
    rowChunks.forEach((r, idx) => {
      const tdCells = [...r.matchAll(/<div class="td-cell([^"]*)">/g)].map(m => m[1].trim());
      if (tdCells.length !== thCells.length) {
        console.error(`  ERROR in Row ${idx + 1}: expected ${thCells.length} cells, got ${tdCells.length} cells!`);
        console.error('    Expected header classes:', thCells);
        console.error('    Found row classes:', tdCells);
        totalErrors++;
      }
    });
  } else if (isTable) {
    const theadMatch = content.match(/<thead>([\s\S]*?)<\/thead>/);
    const thCount = theadMatch ? (theadMatch[1].match(/<th/g) || []).length : 0;
    console.log(`Header th count: ${thCount}`);

    const tbodyMatch = content.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
    const rows = tbodyMatch ? tbodyMatch[1].split(/<\/tr>/).filter(r => r.includes('<td')) : [];
    console.log(`Rows found: ${rows.length}`);
    rows.forEach((r, idx) => {
      const tdCount = (r.match(/<td/g) || []).length;
      if (tdCount !== thCount) {
        console.error(`  ERROR in Row ${idx + 1}: expected ${thCount} cells, got ${tdCount} cells!`);
        totalErrors++;
      }
    });
  }
});

console.log(`\n========================================`);
console.log(`Table check complete. Total errors: ${totalErrors}`);
if (totalErrors > 0) {
  process.exit(1);
}
