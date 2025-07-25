import React, { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  placeholder,
  children,
  disabled,
  className,
  multiple = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const options = React.Children.toArray(children)
    .filter(Boolean)
    .map((child: any) => ({
      value: child.props.value,
      label: child.props.children,
      disabled: child.props.disabled,
    }));

  const selectedValues = multiple ? value.split(",").filter(Boolean) : [value];
  const selected = multiple
    ? options.filter((opt) => selectedValues.includes(opt.value))
    : options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((idx) => {
          const next = idx === null ? 0 : Math.min(options.length - 1, idx + 1);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((idx) => {
          const prev = idx === null ? options.length - 1 : Math.max(0, idx - 1);
          return prev;
        });
      } else if (e.key === "Enter" && focusedIndex !== null) {
        const opt = options[focusedIndex];
        if (!opt.disabled) {
          if (multiple) {
            handleMultiSelect(opt.value);
          } else {
            onChange(opt.value);
            setOpen(false);
          }
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, focusedIndex, options, onChange, multiple, value]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((opt) => opt.value === (multiple ? selectedValues[0] : value));
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleMultiSelect(optionValue: string) {
    let newSelected: string[];
    if (optionValue === "all") {
      // If 'all' is selected, select only 'all'
      newSelected = ["all"];
    } else {
      newSelected = selectedValues.filter((v) => v !== "all");
      if (selectedValues.includes(optionValue)) {
        newSelected = newSelected.filter((v) => v !== optionValue);
      } else {
        newSelected = [...newSelected, optionValue];
      }
      // If any option other than 'all' is selected, 'all' should be unchecked
      if (newSelected.length === 0) {
        newSelected = ["all"];
      }
    }
    onChange(newSelected.join(","));
  }

  return (
    <div className={`relative ${className || ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>
          {multiple
            ? Array.isArray(selected) && selected.length > 0
              ? (selected as { value: any; label: any; disabled: any }[]).map((s) => s.label).join(", ")
              : <span className="text-muted-foreground">{placeholder}</span>
            : selected && !Array.isArray(selected)
              ? selected.label
              : <span className="text-muted-foreground">{placeholder}</span>
          }
        </span>
        <svg
          className="h-4 w-4 ml-2 opacity-60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          tabIndex={-1}
          className="absolute left-0 z-20 mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-lg max-h-60 overflow-auto focus:outline-none m-[2px] p-1 space-y-1"
          role="listbox"
        >
          {React.Children.map(children, (child: any, idx) => {
            if (!child) return null;
            let isSelected;
            if (multiple) {
              if (selectedValues.length === 1 && selectedValues[0] === "all") {
                isSelected = child.props.value === "all";
              } else if (child.props.value === "all") {
                isSelected = false;
              } else {
                isSelected = selectedValues.includes(child.props.value);
              }
            } else {
              isSelected = value === child.props.value;
            }
            const isFocused = focusedIndex === idx;
            return React.cloneElement(child, {
              selected: isSelected,
              'aria-selected': isSelected,
              focused: isFocused,
              onClick: (e: any) => {
                if (!child.props.disabled) {
                  if (multiple) {
                    handleMultiSelect(child.props.value);
                    // Do NOT close dropdown for multi-select
                  } else {
                    onChange(child.props.value);
                    setOpen(false); // Only close for single-select
                  }
                }
                if (child.props.onClick) child.props.onClick(e);
              },
              onMouseEnter: () => setFocusedIndex(idx),
              multiple,
            });
          })}
        </ul>
      )}
    </div>
  );
}

interface CustomSelectOptionProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  multiple?: boolean;
}

export function CustomSelectOption({
  value,
  children,
  disabled,
  selected,
  focused,
  onClick,
  onMouseEnter,
  multiple = false,
}: CustomSelectOptionProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={-1}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 pl-7 text-sm transition-colors
        ${selected ? "bg-accent text-accent-foreground font-medium" : ""}
        ${focused && !selected ? "bg-muted" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
    >
      {multiple ? (
        <input
          type="checkbox"
          checked={!!selected}
          readOnly
          className="absolute left-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          tabIndex={-1}
        />
      ) : selected ? (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : null}
      {children}
    </li>
  );
}
