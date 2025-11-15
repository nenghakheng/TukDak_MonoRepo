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
          <MagnifyingGlassIcon className="h-6 w-6 text-rose-400 dark:text-rose-500 group-focus-within:text-rose-600 dark:group-focus-within:text-rose-400 transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search guests by ID, name (English or Khmer)"
          className="block w-full pl-12 pr-12 py-4 text-lg border-0 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 shadow-lg ring-1 ring-rose-200 dark:ring-rose-800 placeholder:text-rose-400 dark:placeholder:text-rose-500 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:outline-none transition-all duration-200 ease-in-out hover:shadow-xl"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
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
                ? "bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-700 dark:to-pink-700 text-white shadow-md"
                : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 shadow-sm"
            }`}
          >
            {guestOf || "All Guests"}
          </button>
        ))}
      </div>
    </div>
  );
};
