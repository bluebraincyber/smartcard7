"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowUpDown, Check, Plus } from "lucide-react";

type StatusFilter = "all" | "active" | "archived";
type SortOption = "recent" | "az" | "views";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "archived", label: "Arquivadas" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "az", label: "A–Z" },
  { value: "views", label: "Mais visualizadas" },
];

type Props = {
  searchQuery: string;
  onSearch: (query: string) => void;
  statusFilter: StatusFilter;
  onFilterStatus: (status: StatusFilter) => void;
  sortBy: SortOption;
  onSort: (sort: SortOption) => void;
  onCreateStore: () => void;
};

export default function StoresToolbar({ 
  searchQuery,
  onSearch, 
  statusFilter,
  onFilterStatus, 
  sortBy,
  onSort, 
  onCreateStore 
}: Props) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClearSearch = () => {
    onSearch("");
  };

  const selectedSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || "Ordenar";
  const selectedStatusLabel = statusFilters.find(f => f.value === statusFilter)?.label || "Status";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar lojas por nome ou slug..."
          className="block w-full rounded-lg border-0 bg-white py-3 pl-10 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          aria-label="Buscar lojas"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Dropdown */}
          <div className="relative inline-block text-left" ref={statusRef}>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              id="status-menu"
              aria-expanded="true"
              aria-haspopup="true"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              {selectedStatusLabel}
              <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="none">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        onFilterStatus(filter.value);
                        setIsStatusOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        statusFilter === filter.value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                      {statusFilter === filter.value && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-block text-left" ref={sortRef}>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              id="sort-menu"
              aria-expanded="true"
              aria-haspopup="true"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              {selectedSortLabel}
            </button>

            {isSortOpen && (
              <div className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="none">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSort(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                        sortBy === option.value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Store Button */}
        <button
          onClick={onCreateStore}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 h-5 w-5" />
          Nova Loja
        </button>
      </div>
    </div>
  );
}
