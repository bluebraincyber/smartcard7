"use client";

import React, { useState, useMemo } from 'react';
import { useAnalytics } from './context';
import { formatNumber, formatPercentage } from '@/lib/analytics/stats';
import { DownloadIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { toCSV } from '@/lib/analytics/csv';

interface PageData {
  path: string;
  title: string;
  views: number;
  avgTime: number;
  change: number;
}

// Mock data - replace with real API call
const generateMockData = (): PageData[] => {
  const pages = [
    { path: '/', title: 'Home' },
    { path: '/products', title: 'Products' },
    { path: '/pricing', title: 'Pricing' },
    { path: '/about', title: 'About Us' },
    { path: '/contact', title: 'Contact' },
    { path: '/blog', title: 'Blog' },
    { path: '/docs', title: 'Documentation' },
  ];

  return pages.map(page => ({
    ...page,
    views: Math.floor(Math.random() * 10000) + 1000,
    avgTime: Math.floor(Math.random() * 300) + 30,
    change: (Math.random() * 30) - 15, // -15% to +15%
  }));
};

type SortField = 'path' | 'views' | 'avgTime' | 'change';
type SortDirection = 'asc' | 'desc';

export function PagesRankingTable() {
  const { filters } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: 'views', direction: 'desc' });

  // Generate mock data - replace with real data fetching
  const data = useMemo(() => {
    return generateMockData();
  }, [filters]);

  const filteredData = useMemo(() => {
    return data.filter(page => 
      page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      let comparison = 0;
      
      if (sortConfig.field === 'path') {
        comparison = a.path.localeCompare(b.path);
      } else if (sortConfig.field === 'views') {
        comparison = a.views - b.views;
      } else if (sortConfig.field === 'avgTime') {
        comparison = a.avgTime - b.avgTime;
      } else if (sortConfig.field === 'change') {
        comparison = a.change - b.change;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return sortableData;
  }, [filteredData, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleExport = () => {
    type ExportKey = 'path' | 'title' | 'views' | 'avgTime' | 'change';
    const headers: { key: ExportKey; label: string }[] = [
      { key: 'path', label: 'Página' },
      { key: 'title', label: 'Título' },
      { key: 'views', label: 'Visualizações' },
      { key: 'avgTime', label: 'Tempo Médio (s)' },
      { key: 'change', label: 'Variação (%)' },
    ];

    const csvData = filteredData.map(page => ({
      ...page,
      change: `${page.change > 0 ? '+' : ''}${page.change.toFixed(1)}%`,
    }));

    toCSV(csvData, headers, 'paginas_ranking');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUpIcon className="w-3 h-3 ml-1 inline" />
    ) : (
      <ArrowDownIcon className="w-3 h-3 ml-1 inline" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DownloadIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('path')}
                >
                  Página <SortIcon field="path" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('views')}
                >
                  Visualizações <SortIcon field="views" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('avgTime')}
                >
                  Tempo Médio <SortIcon field="avgTime" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('change')}
                >
                  Variação <SortIcon field="change" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    <div className="text-sm text-gray-500">{page.path}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatNumber(page.views)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{Math.floor(page.avgTime / 60)}m {page.avgTime % 60}s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.change > 0 
                          ? 'bg-green-100 text-green-800' 
                          : page.change < 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {page.change > 0 ? '+' : ''}{page.change.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
