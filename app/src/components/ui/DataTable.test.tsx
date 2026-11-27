// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DataTable, TablePaginationFooter, formatEntityCount } from './DataTable';

afterEach(() => {
  cleanup();
});

describe('formatEntityCount', () => {
  it('singularizes standard -ies and -s nouns when count is 1', () => {
    expect(formatEntityCount(1, 'entries')).toBe('entry');
    expect(formatEntityCount(1, 'categories')).toBe('category');
    expect(formatEntityCount(1, 'students')).toBe('student');
    expect(formatEntityCount(1, 'departments')).toBe('department');
    expect(formatEntityCount(1, 'programs')).toBe('program');
  });

  it('keeps plural form when count is 0 or greater than 1', () => {
    expect(formatEntityCount(0, 'entries')).toBe('entries');
    expect(formatEntityCount(2, 'entries')).toBe('entries');
    expect(formatEntityCount(0, 'students')).toBe('students');
    expect(formatEntityCount(5, 'students')).toBe('students');
  });

  it('uses explicit singularEntityName when provided and preserves -ss nouns', () => {
    expect(formatEntityCount(1, 'faculty', 'faculty')).toBe('faculty');
    expect(formatEntityCount(2, 'faculty', 'faculty')).toBe('faculty');
    expect(formatEntityCount(1, 'class')).toBe('class');
  });
});

describe('TablePaginationFooter & DataTable grammar (#190)', () => {
  it('renders "1 entry" instead of "1 entries" when totalEntries is 1', () => {
    render(
      <DataTable
        data={[{ id: '1', name: 'Computer Science' }]}
        getRowId={(row) => row.id}
        columns={[{ key: 'name', label: 'Department' }]}
      />
    );

    expect(screen.getByText('Page 1 of 1 · 1 entry')).toBeInTheDocument();
  });

  it('renders "2 entries" when totalEntries is 2 and "0 entries" when empty', () => {
    const { rerender } = render(
      <TablePaginationFooter
        currentPage={1}
        totalPages={1}
        totalEntries={2}
        pageSize={5}
        onPageSizeChange={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Page 1 of 1 · 2 entries')).toBeInTheDocument();

    rerender(
      <TablePaginationFooter
        currentPage={1}
        totalPages={1}
        totalEntries={0}
        pageSize={5}
        onPageSizeChange={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });

  it('renders loading label while loading', () => {
    render(
      <TablePaginationFooter
        currentPage={1}
        totalPages={1}
        totalEntries={1}
        pageSize={5}
        isLoading
        onPageSizeChange={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Loading entries…')).toBeInTheDocument();
  });
});
