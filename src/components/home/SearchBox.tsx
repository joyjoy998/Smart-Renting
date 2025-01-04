import React from "react";
import { MenuButton } from "./MenuButton";
import { Search } from "lucide-react";
import { Sidebar } from "../sidebar/Sidebar";

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Search Google Maps",
  onSearch,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    onSearch?.(input.value);
  };

  return (
    <>
      <div className="absolute left-4 top-[0.5rem] w-full max-w-[280px] z-[1000]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <MenuButton />
            </div>
            <input
              name="search"
              type="text"
              placeholder={placeholder}
              className="w-full rounded-full border border-gray-200 bg-white/80 py-1.5 pl-14 pr-4 shadow-lg outline-none focus:border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm"
            />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </form>
      </div>
      <Sidebar />
    </>
  );
};
