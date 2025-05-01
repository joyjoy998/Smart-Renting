"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import type { Driver as DriverType, DriveStep } from "driver.js";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useArchiveStore } from "@/stores/useArchiveStore";

import { HelpCircle } from "lucide-react";
import "driver.js/dist/driver.css";

const GuidedTour = () => {
  const driverRef = useRef<DriverType | null>(null);

  const { setOpen } = useSidebarStore();

  const steps: DriveStep[] = [
    {
      element: "#theme-toggle",
      popover: {
        title: "Theme Toggle",
        description: "Click to switch between light and dark mode.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#map-guide-anchor",
      popover: {
        title: "Map Container",
        description:
          "This is the map container where you can view the map. You can click on the map to save POIs and properties of interest.",
        side: "top",
        align: "center",
        onNextClick: () => {
          setOpen(true);
        },
      },
    },
  ];

  useEffect(() => {
    driverRef.current = driver({
      showProgress: true,
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Done",
      steps: steps,
      stagePadding: 0,
    });
  }, []);

  const startTour = () => {
    if (!driverRef.current) return;
    setOpen(false);
    driverRef.current.drive();
  };

  return (
    <button
      className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
      onClick={startTour}
    >
      <HelpCircle className="h-5 w-5" />
      <span>Help/Guidance</span>
    </button>
  );
};

export default GuidedTour;
