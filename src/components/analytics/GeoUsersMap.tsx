"use client";

import React, { useState, useMemo } from 'react';
import { formatNumber } from '@/lib/analytics/stats';
import { Globe, Table } from 'lucide-react';

// Mock data for countries
const countryData = [
  { code: 'BR', name: 'Brasil', users: 12453, percentage: 42.5 },
  { code: 'US', name: 'Estados Unidos', users: 8562, percentage: 29.2 },
  { code: 'PT', name: 'Portugal', users: 3215, percentage: 11.0 },
  { code: 'ES', name: 'Espanha', users: 1987, percentage: 6.8 },
  { code: 'DE', name: 'Alemanha', users: 987, percentage: 3.4 },
  { code: 'FR', name: 'França', users: 765, percentage: 2.6 },
  { code: 'GB', name: 'Reino Unido', users: 654, percentage: 2.2 },
  { code: 'IT', name: 'Itália', users: 543, percentage: 1.9 },
  { code: 'CA', name: 'Canadá', users: 432, percentage: 1.5 },
  { code: 'AU', name: 'Austrália', users: 321, percentage: 1.1 },
  { code: 'JP', name: 'Japão', users: 219, percentage: 0.7 },
  { code: 'CN', name: 'China', users: 198, percentage: 0.7 },
  { code: 'IN', name: 'Índia', users: 165, percentage: 0.6 },
  { code: 'RU', name: 'Rússia', users: 132, percentage: 0.5 },
  { code: 'MX', name: 'México', users: 98, percentage: 0.3 },
];

// Simple world map placeholder component
const SimpleWorldMap = () => {
  return (
    <div className="h-80 w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Mapa Mundial</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Visualização geográfica em desenvolvimento. 
          Use a visualização em tabela para ver os dados por país.
        </p>
      </div>
    </div>
  );
};

type ViewMode = 'map' | 'table';

export function GeoUsersMap() {
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table view
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Get the top 10 countries for the table view
  const tableData = useMemo(() => {
    return [...countryData]
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);
  }, []);

  // Get the selected country data
  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return null;
    return countryData.find(c => c.code.toLowerCase() === selectedCountry.toLowerCase());
  }, [selectedCountry]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          Distribuição de usuários por país
        </h3>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-l-lg border ${
              viewMode === 'map'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('map')}
          >
            <Globe className="w-4 h-4 inline-block mr-1.5" />
            Mapa
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium rounded-r-lg border ${
              viewMode === 'table'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('table')}
          >
            <Table className="w-4 h-4 inline-block mr-1.5" />
            Tabela
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <SimpleWorldMap />
      ) : (
        <div className="overflow-hidden bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuários
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % do Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((country, index) => (
                  <tr 
                    key={country.code}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedCountry === country.code.toLowerCase() ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedCountry(country.code.toLowerCase())}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          <div className={`h-full w-full flex items-center justify-center text-xs font-medium ${
                            index < 3 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {country.code}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{country.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(country.users)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index < 3 ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(100, (country.percentage / countryData[0].percentage) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{country.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedCountryData && (
            <div className="bg-blue-50 border-t border-blue-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">{selectedCountryData.name}</h4>
                  <p className="text-sm text-blue-700">
                    {formatNumber(selectedCountryData.users)} usuários ({selectedCountryData.percentage.toFixed(1)}% do total)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Limpar seleção
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
