import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  className?: string;
  placeholder?: string;
  type?: string;
}

export function EditableField({
  value,
  onChange,
  onSave,
  className = '',
  placeholder = '',
  type = 'text',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className={`editable-field ${className}`}>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            onSave();
            setIsEditing(false);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
        >
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      )}
    </div>
  );
}
