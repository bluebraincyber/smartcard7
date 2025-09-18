import { Plus } from 'lucide-react';

interface AddItemCardProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function AddItemCard({ 
  onClick, 
  label, 
  className = '' 
}: AddItemCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-6 border-2 border-dashed 
        rounded-lg cursor-pointer transition-colors duration-200
        hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
        border-gray-300 dark:border-gray-600
        ${className}`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mb-2">
        <Plus className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </div>
  );
}
