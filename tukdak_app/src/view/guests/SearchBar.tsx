import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  guestOfFilter: string;
  onGuestOfChange: (value: string) => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  guestOfFilter,
  onGuestOfChange,
}: SearchBarProps) => {
  return (
    <div className="space-y-4">
      {/* Main Search Bar - Apple Inspired */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search guests by ID, name (English or Khmer)"
          className="block w-full pl-12 pr-12 py-4 text-lg border-0 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ease-in-out hover:shadow-xl"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </div>

      {/* Guest Of Filter */}
      <div className="flex flex-wrap gap-2">
        {["", "Bride", "Groom"].map((guestOf) => (
          <button
            key={guestOf || "all"}
            onClick={() => onGuestOfChange(guestOf)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              guestOfFilter === guestOf
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
            }`}
          >
            {guestOf || "All Guests"}
          </button>
        ))}
      </div>
    </div>
  );
};
