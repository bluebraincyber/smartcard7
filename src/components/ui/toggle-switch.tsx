import { useState, useEffect } from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  className?: string;
}

export function ToggleSwitch({ 
  enabled, 
  onChange, 
  label, 
  className = '' 
}: ToggleSwitchProps) {
  const [isOn, setIsOn] = useState(enabled);

  useEffect(() => {
    setIsOn(enabled);
  }, [enabled]);

  const toggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange(newState);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOn ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        role="switch"
        aria-checked={isOn}
        onClick={toggle}
      >
        <span
          className={`${
            isOn ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </span>
      )}
    </div>
  );
}
