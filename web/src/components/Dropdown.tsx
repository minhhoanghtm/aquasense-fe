import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt (bỏ dấu) để tìm kiếm không phân biệt dấu và hoa thường
 */
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  icon,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm trong danh sách...',
  emptyMessage = 'Không tìm thấy kết quả phù hợp',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  // Lọc danh sách theo từ khóa tìm kiếm (hỗ trợ cả tiếng Việt có dấu và không dấu)
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = normalizeText(search);
    return options.filter((opt) => {
      const normLabel = normalizeText(opt.label);
      const normVal = normalizeText(opt.value);
      const normDesc = opt.description ? normalizeText(opt.description) : '';
      return (
        normLabel.includes(term) ||
        normVal.includes(term) ||
        normDesc.includes(term)
      );
    });
  }, [options, search]);

  const updatePosition = useCallback(() => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = 280;
    const shouldOpenUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

    if (shouldOpenUpward) {
      setMenuPosition({
        bottom: window.innerHeight - rect.top + 6,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Tự động focus ô tìm kiếm & tính toán tọa độ khi mở dropdown
  useEffect(() => {
    if (open) {
      setSearch('');
      updatePosition();

      const handleScrollOrResize = () => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setOpen(false);
          return;
        }
        updatePosition();
      };

      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);

      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }

      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    } else {
      setMenuPosition(null);
    }
  }, [open, searchable, updatePosition]);

  // Đóng khi click ngoài (kiểm tra cả nút trigger và portal menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${open ? 'z-[9999]' : 'z-10'} ${className}`}
    >
      {/* Nút trigger dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex
          h-10
          w-full
          items-center
          justify-between
          gap-2
          rounded-xl
          border
          border-[var(--panel-border)]
          bg-[var(--panel-bg-dark)]
          px-3
          py-2
          text-left
          text-xs
          text-[var(--text-primary)]
          transition-colors
          duration-150
          hover:border-cyan-500
          focus:outline-none
          focus:border-[var(--accent)]
          focus:ring-1
          focus:ring-[var(--accent)]/40
          disabled:cursor-not-allowed
          disabled:opacity-50
          cursor-pointer
          ${buttonClassName}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-cyan-400">{icon}</span>}
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span
            className="truncate font-medium"
            title={selectedOption?.label || placeholder}
          >
            {selectedOption?.label || (
              <span className="text-[var(--text-muted)]">{placeholder}</span>
            )}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`
            shrink-0
            text-[var(--text-muted)]
            transition-transform
            duration-200
            ${open ? 'rotate-180 text-[var(--accent)]' : ''}
          `}
        />
      </button>

      {/* Menu xổ xuống - Render qua React Portal tại document.body để luôn nằm trên cùng (z-index cao nhất, không bị che/cắt bởi modal hay overflow) */}
      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              ...(menuPosition.top !== undefined
                ? { top: `${menuPosition.top}px` }
                : { bottom: `${menuPosition.bottom}px` }),
              zIndex: 999999,
            }}
            className={`
              overflow-hidden
              rounded-2xl
              border
              border-[var(--panel-border-strong)]
              bg-[#051c24]
              shadow-[0_20px_50px_rgba(0,0,0,0.95)]
              ring-1
              ring-cyan-500/40
              animate-fadeIn
              ${menuClassName}
            `}
          >
          {/* Ô tìm kiếm tích hợp trong dropdown */}
          {searchable && (
            <div className="p-2 border-b border-[var(--divider)]/60 bg-[#04161d]">
              <div className="relative flex items-center">
                <Search
                  size={13}
                  className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={searchPlaceholder}
                  className="
                    w-full
                    h-8
                    pl-8
                    pr-7
                    text-xs
                    rounded-lg
                    border
                    border-[var(--panel-border)]
                    bg-[#07242e]
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    outline-none
                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]/30
                    transition-colors
                  "
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 p-0.5 text-[var(--text-muted)] hover:text-white cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Danh sách các lựa chọn */}
          <div className="max-h-56 overflow-y-auto custom-scrollbar p-1 divide-y divide-[var(--divider)]/30">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-2
                      px-3
                      py-2
                      rounded-lg
                      text-left
                      text-xs
                      transition-colors
                      cursor-pointer
                      ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-200 font-semibold border border-teal-500/40'
                          : 'text-[var(--text-body)] hover:bg-cyan-950/50 hover:text-white'
                      }
                      ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {option.icon && (
                        <span className="shrink-0">{option.icon}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium" title={option.label}>
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-[10px] text-[var(--text-subtle)] truncate mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {option.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={14} className="text-teal-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-6 text-center text-xs text-[var(--text-muted)] italic">
                {search ? (
                  <>
                    <div>{emptyMessage}</div>
                    <div className="text-[11px] text-[var(--text-subtle)] mt-1">
                      Từ khóa: "{search}"
                    </div>
                  </>
                ) : (
                  emptyMessage
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dropdown;
