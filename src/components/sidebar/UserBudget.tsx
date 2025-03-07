import React, { useEffect, useRef, useState } from "react";
import { useBudgetStore } from "@/stores/useSettingsStore";

const UserBudget: React.FC = () => {
  const { minPrice, maxPrice, setMinPrice, setMaxPrice } = useBudgetStore();
  const [sliderWidth, setSliderWidth] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  const absoluteMin = 0;
  const absoluteMax = 1000;
  const step = 10;

  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
      updateSlider();
    }

    const handleResize = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [minPrice, maxPrice]);

  const updateSlider = () => {
    if (!rangeRef.current || !minThumbRef.current || !maxThumbRef.current)
      return;

    const rangeWidth = sliderRef.current.offsetWidth;
    const minPos =
      ((minPrice - absoluteMin) / (absoluteMax - absoluteMin)) * rangeWidth;
    const maxPos =
      ((maxPrice - absoluteMin) / (absoluteMax - absoluteMin)) * rangeWidth;

    rangeRef.current.style.left = `${minPos}px`;
    rangeRef.current.style.width = `${maxPos - minPos}px`;
    minThumbRef.current.style.left = `${minPos}px`;
    maxThumbRef.current.style.left = `${maxPos}px`;
  };

  useEffect(() => {
    updateSlider();
  }, [minPrice, maxPrice, sliderWidth]);

  const handleMinDrag = (e: MouseEvent) => {
    if (!sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const newPos = (e.clientX - sliderRect.left) / sliderRect.width;
    const newMinPrice =
      Math.round(
        Math.min(
          Math.max(
            newPos * (absoluteMax - absoluteMin) + absoluteMin,
            absoluteMin
          ),
          maxPrice - step
        ) / step
      ) * step;

    setMinPrice(newMinPrice);
  };

  const handleMaxDrag = (e: MouseEvent) => {
    if (!sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const newPos = (e.clientX - sliderRect.left) / sliderRect.width;
    const newMaxPrice =
      Math.round(
        Math.max(
          Math.min(
            newPos * (absoluteMax - absoluteMin) + absoluteMin,
            absoluteMax
          ),
          minPrice + step
        ) / step
      ) * step;

    setMaxPrice(newMaxPrice);
  };

  const handleDrag = (updateFn: (e: MouseEvent) => void) => {
    const handleMouseMove = (e: MouseEvent) => {
      updateFn(e);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="font-medium text-gray-800 mb-4">Budget</h3>
        <div className="text-gray-700 mb-6">
          ${minPrice} - ${maxPrice} / Week
        </div>

        <div className="relative h-12" ref={sliderRef}>
          {/* 背景轨道 */}
          <div className="absolute  left-0 right-0 h-1 bg-gray-200 rounded-full" />

          {/* 选定范围 */}
          <div
            ref={rangeRef}
            className="absolute  h-1 bg-green-600 rounded-full"
          />

          {/* 最小值滑块 */}
          <div
            ref={minThumbRef}
            className="absolute  -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full cursor-pointer"
            onMouseDown={() => handleDrag(handleMinDrag)}
          />

          {/* 最大值滑块 */}
          <div
            ref={maxThumbRef}
            className="absolute  -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full cursor-pointer"
            onMouseDown={() => handleDrag(handleMaxDrag)}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UserBudget;
