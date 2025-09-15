// src/lib/analytics/csv.ts

import { format } from 'date-fns';

interface CSVData {
  [key: string]: string | number | null | undefined;
}

export function toCSV<T extends CSVData>(
  data: T[],
  headers: Array<{ key: keyof T; label: string }>,
  filename: string
): void {
  // Escape quotes and wrap in quotes
  const escape = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Create CSV header
  const headerRow = headers.map((h) => h.label).join(',');

  // Create CSV rows
  const rows = data.map((item) =>
    headers.map(({ key }) => escape(item[key])).join(',')
  );

  // Combine header and rows
  const csvContent = [headerRow, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateExportFilename(prefix: string): string {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  return `${prefix}_${timestamp}`;
}

// Helper to convert array of objects to CSV string
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  columns: Array<{ key: keyof T; label: string }>
): string {
  const headers = columns.map((col) => `"${col.label}"`).join(',');
  const rows = data.map((item) =>
    columns
      .map(({ key }) => {
        const value = item[key];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Convert to string and escape quotes
        const str = String(value);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headers, ...rows].join('\n');
}
