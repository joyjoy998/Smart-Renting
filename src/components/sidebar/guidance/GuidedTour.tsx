"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import type { Driver as DriverType, DriveStep } from "driver.js";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { HelpCircle } from "lucide-react";
import "driver.js/dist/driver.css";
import { set } from "lodash";

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
      },
    },
    {
      element: "#sidebar-menu-button",
      popover: {
        title: "Sidebar",
        description:
          "This is the sidebar where you can access different features and settings.",
        side: "bottom",
        align: "start",
        onNextClick: () => {
          setOpen(true);
          driverRef.current?.moveNext();
        },
      },
    },
    {
      element: "#archive-management",
      popover: {
        title: "Archive Management",
        description:
          "This is the archive management section where you can use it to manage POIs and properties saved in different scenarios.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#saved-poi",
      popover: {
        title: "Saved POI",
        description:
          "This is the saved POI section where you can view and manage your saved points of interest.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#saved-property",
      popover: {
        title: "Saved Property",
        description:
          "This is the saved property section where you can view and manage your saved properties.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#comparison-report",
      popover: {
        title: "Comparison Report",
        description:
          "This is the comparison report section allows you to create detailed, personalized reports that rank and evaluate rental properties based on their marked Points of Interest (POIs), preferences, and other input criteria.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#recommendation",
      popover: {
        title: "Recommendation",
        description:
          "This is the recommendation section where you can find suitable rental properties that match your needs and habits based on the marked POIs, preferences, and other input criteria.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#settings",
      popover: {
        title: "Settings",
        description:
          "This is the settings section where you can adjust your rental preferences and budgets.",
        side: "right",
        align: "end",
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
