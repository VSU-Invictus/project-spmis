import React, { forwardRef } from 'react';

export const TableContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`ui-table-wrap ${className}`.trim()} {...props}>
    {children}
  </div>
));
TableContainer.displayName = 'TableContainer';

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <table ref={ref} className={`ui-table ${className}`.trim()} {...props}>
    {children}
  </table>
));
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <thead ref={ref} className={className} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <tfoot ref={ref} className={className} {...props}>
    {children}
  </tfoot>
));
TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <tr ref={ref} className={className} {...props}>
    {children}
  </tr>
));
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <th ref={ref} className={className} {...props}>
    {children}
  </th>
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <td ref={ref} className={className} {...props}>
    {children}
  </td>
));
TableCell.displayName = 'TableCell';

