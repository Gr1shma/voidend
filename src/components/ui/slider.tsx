import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "~/lib/utils";

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    ...props
}: SliderPrimitive.Root.Props) {
    const _values = Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max];

    return (
        <SliderPrimitive.Root
            className={cn("relative flex w-full touch-none select-none", className)}
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            thumbAlignment="edge"
            {...props}
        >
            <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none gap-3 data-disabled:opacity-50">
                <SliderPrimitive.Track
                    data-slot="slider-track"
                    className="relative flex h-2 w-full overflow-hidden rounded-full bg-border"
                >
                    <SliderPrimitive.Indicator
                        data-slot="slider-range"
                        className="absolute left-0 top-0 h-full bg-primary"
                    />
                </SliderPrimitive.Track>
                {Array.from({ length: _values.length }, (_, index) => (
                    <SliderPrimitive.Thumb
                        data-slot="slider-thumb"
                        key={index}
                        className="relative z-10 block h-5 w-5 rounded-full border border-input bg-background shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    />
                ))}
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    );
}

export { Slider };
