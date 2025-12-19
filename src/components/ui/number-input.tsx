import * as React from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowFloat?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min, max, step = 1, allowFloat = false, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(String(value));

    // Sync internal value when external value changes
    React.useEffect(() => {
      setInternalValue(String(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Allow empty string for deletion
      if (newValue === '' || newValue === '-') {
        setInternalValue(newValue);
        return;
      }

      // Validate the input
      const regex = allowFloat ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
      if (regex.test(newValue)) {
        setInternalValue(newValue);
        
        // Parse and update parent if valid number
        const parsed = allowFloat ? parseFloat(newValue) : parseInt(newValue, 10);
        if (!isNaN(parsed)) {
          let finalValue = parsed;
          if (max !== undefined && parsed > max) finalValue = max;
          if (min !== undefined && parsed < min) finalValue = min;
          onChange(finalValue);
        }
      }
    };

    const handleBlur = () => {
      // On blur, ensure we have a valid value
      let parsed = allowFloat ? parseFloat(internalValue) : parseInt(internalValue, 10);
      
      if (isNaN(parsed)) {
        parsed = min !== undefined ? min : 0;
      }
      
      if (min !== undefined && parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;
      
      setInternalValue(String(parsed));
      onChange(parsed);
    };

    return (
      <input
        type="text"
        inputMode={allowFloat ? "decimal" : "numeric"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
