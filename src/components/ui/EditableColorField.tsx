import { useState } from 'react';

interface EditableColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  className?: string;
}

export function EditableColorField({
  value,
  onChange,
  onSave,
  className = '',
}: EditableColorFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [color, setColor] = useState(value);

  const handleSave = () => {
    onChange(color);
    onSave();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setColor(value);
    }
  };

  return (
    <div className={`editable-color-field ${className}`}>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-gray-300"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div 
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono">{value.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
