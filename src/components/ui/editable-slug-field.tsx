import { useState } from 'react';
import { Copy } from 'lucide-react';

interface EditableSlugFieldProps {
  value: string;
  baseUrl: string;
  onChange: (value: string) => void;
  onSave: () => void;
  className?: string;
}

export function EditableSlugField({
  value,
  baseUrl,
  onChange,
  onSave,
  className = '',
}: EditableSlugFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${baseUrl}/${value}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className={`editable-slug-field ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">{baseUrl}/</span>
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              onSave();
              setIsEditing(false);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <span 
              onClick={() => setIsEditing(true)}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
            >
              {value}
            </span>
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            {isCopied && <span className="text-sm text-green-500">Copied!</span>}
          </div>
        )}
      </div>
    </div>
  );
}
