import React from "react";
type Size = "sm" | "md" | "lg";
type Color = "blue" | "red" | "green" | "gray";
interface LoadingProps {
  size?: Size;
  color?: Color;
  fullscreen?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const colorClasses: Record<Color, string> = {
  blue: "border-blue-500",
  red: "border-red-500",
  green: "border-green-500",
  gray: "border-gray-500",
};

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  color = "blue",
  fullscreen = true,
}) => {
  // console.log("Loading rendered");
  return (
    <div
      className={`fixed inset-0
      flex items-center justify-center
      bg-white/50 
      z-[9999] ${
        fullscreen ? "min-h-screen w-full" : "min-h-[inherit] w-full"
      }`}
    >
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-4
          border-t-transparent
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
};

export default Loading;
