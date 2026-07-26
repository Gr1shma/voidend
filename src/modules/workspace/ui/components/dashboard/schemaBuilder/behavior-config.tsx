import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";
import { FieldLabel } from "./field-label";

interface BehaviorConfigProps {
    delayMs: number;
    onDelayMsChange: (value: number) => void;
    failureRate: number;
    onFailureRateChange: (value: number) => void;
    responseCount: number;
    onResponseCountChange: (value: number) => void;
}

export function BehaviorConfig({
    delayMs,
    onDelayMsChange,
    failureRate,
    onFailureRateChange,
    responseCount,
    onResponseCountChange,
}: BehaviorConfigProps) {
    return (
        <>
            <Separator />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                    <FieldLabel tooltip="Simulated network latency before this endpoint responds.">
                        Delay
                    </FieldLabel>
                    <div className="relative">
                        <Input
                            id="delay-ms"
                            type="number"
                            min={0}
                            value={delayMs}
                            onChange={(e) => onDelayMsChange(Number(e.target.value))}
                            className="h-10 border-0 bg-muted pr-10 font-mono shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                            ms
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <FieldLabel tooltip="Probability that a request to this endpoint returns an error response.">
                        Failure rate
                    </FieldLabel>
                    <div className="flex h-10 items-center gap-3 rounded-md bg-muted px-3">
                        <Slider
                            value={[failureRate]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={(value) =>
                                onFailureRateChange(Array.isArray(value) ? value[0]! : value)
                            }
                            className="flex-1"
                        />
                        <span className="w-7 shrink-0 text-right font-mono text-xs tabular-nums">
                            {failureRate.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="col-span-2 space-y-1.5 md:col-span-1">
                    <FieldLabel tooltip="Number of mock items generated per response.">
                        Response count
                    </FieldLabel>
                    <Input
                        id="response-count"
                        type="number"
                        min={1}
                        value={responseCount}
                        onChange={(e) => onResponseCountChange(Number(e.target.value))}
                        placeholder="10"
                        className="h-10 border-0 bg-muted font-mono shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
            </div>
        </>
    );
}
