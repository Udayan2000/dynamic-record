import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Shows a loading spinner on the right side of the input */
  isLoading?: boolean;
  /** Function to call when the clear (X) button is clicked */
  onClear?: () => void;
  /** Delay in milliseconds for the debounced change event (default: 500ms) */
  debounceTime?: number;
  /** Callback fired after the debounce time elapses. Perfect for API calls. */
  onDebouncedChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { 
      className, 
      type, 
      isLoading, 
      onClear, 
      debounceTime = 500, 
      onDebouncedChange, 
      onChange, 
      value,
      defaultValue,
      ...props 
    },
    ref
  ) => {
    // Local state allows the user to type instantly while we delay the debounced callback
    const [localValue, setLocalValue] = React.useState<string>(
      (value as string) || (defaultValue as string) || ""
    );
    
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Keep local state in sync if a controlled value changes externally
    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value as string);
      }
    }, [value]);

    // Cleanup the timeout when the component unmounts
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Call standard onChange if provided (e.g., for react-hook-form)
      if (onChange) {
        onChange(e);
      }

      // Handle the debounced callback
      if (onDebouncedChange) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          onDebouncedChange(newValue);
        }, debounceTime);
      }
    };

    const handleClear = () => {
      setLocalValue("");
      if (onClear) onClear();
      
      // Also trigger the debounce with an empty string when cleared
      if (onDebouncedChange) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onDebouncedChange("");
      }
    };

    const isSearch = type === "search";

    return (
      <div className="relative flex w-full items-center">
        {/* Left side Search Icon */}
        {isSearch && (
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}

        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            isSearch && "pl-9", // Make room for left icon
            isSearch && "pr-10", // Make room for right icons (clear / loading)
            className
          )}
          ref={ref}
          // Support both controlled and uncontrolled usage safely
          value={value !== undefined ? value : localValue}
          onChange={handleChange}
          {...props}
        />

        {/* Right side Icons (Loading / Clear) */}
        {isSearch && (
          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!isLoading && localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground focus:outline-none rounded-full p-0.5 hover:bg-muted transition-colors"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };