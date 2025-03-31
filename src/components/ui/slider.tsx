
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  formatValue?: (value: number[]) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue = false, formatValue, ...props }, ref) => {
  const defaultFormatValue = (value: number[]) => `${value[0]}`;
  const formatter = formatValue || defaultFormatValue;
  
  return (
    <div className="relative w-full">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      
      {showValue && props.value && (
        <div className="absolute -bottom-6 w-full text-center text-sm">
          {formatter(props.value as number[])}
        </div>
      )}
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
