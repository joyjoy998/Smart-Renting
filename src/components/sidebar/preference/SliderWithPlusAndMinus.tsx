"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface SliderProps {
  label: string;
  initialValue: number;
  onChange: (value: number) => void;
}

function SliderWithPlusAndMinus({
  label,
  initialValue,
  onChange,
}: SliderProps) {
  const minValue = 0;
  const maxValue = 1;
  const steps = 0.01;
  const [value, setValue] = useState<number[]>([
    parseFloat(initialValue.toFixed(2)),
  ]);

  const formatValue = (val: number): number => parseFloat(val.toFixed(2));

  const decreaseValue = () =>
    setValue((prev) => [formatValue(Math.max(minValue, prev[0] - steps))]);

  const increaseValue = () =>
    setValue((prev) => [formatValue(Math.min(maxValue, prev[0] + steps))]);

  const handleValueChange = (newValue: number[]) => {
    const formattedValue = formatValue(newValue[0]);
    setValue([formattedValue]);
    onChange(formattedValue);
  };

  return (
    <div className="space-y-3 min-w-[300px]">
      <Label className="tabular-nums">
        {label}: {value[0].toFixed(2)}
      </Label>
      <div className="flex items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Decrease value"
            onClick={decreaseValue}
            disabled={value[0] === minValue}
          >
            <Minus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
        <Slider
          className="grow"
          value={value}
          onValueChange={handleValueChange}
          min={minValue}
          max={maxValue}
          step={steps}
          aria-label="Dual range slider with buttons"
        />
        <div>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Increase value"
            onClick={increaseValue}
            disabled={value[0] === maxValue}
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { SliderWithPlusAndMinus };
