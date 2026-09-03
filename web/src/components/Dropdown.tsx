import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const Dropdown = ({
  value,
  options,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  className = '',
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
    >
      {/* Selected value */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-lg
          border
          border-cyan-800
          bg-[#0b3039]
          px-4
          py-3
          text-left
          text-sm
          text-white
          transition
          hover:border-cyan-500
          focus:outline-none
          focus:border-cyan-400
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <span>
          {selectedOption?.label || placeholder}
        </span>

        <svg
          className={`
            h-4
            w-4
            text-cyan-400
            transition-transform
            ${open ? 'rotate-180' : ''}
          `}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            z-50
            mt-2
            overflow-hidden
            rounded-lg
            border
            border-cyan-800
            bg-[#0b3039]
            shadow-xl
          "
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  flex
                  w-full
                  items-center
                  px-4
                  py-3
                  text-left
                  text-sm
                  transition
                  ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-300 hover:bg-cyan-500/10 hover:text-white'
                  }
                `}
              >
                {option.label}

                {isSelected && (
                  <svg
                    className="ml-auto h-4 w-4 text-cyan-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 8"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;