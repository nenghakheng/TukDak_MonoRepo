import { useState, useMemo } from "react";
import { useGuestsQuery } from "../../hooks/useGuest";
import { SearchBar } from "./SearchBar";
import { GuestsTable } from "./GuestsTable";

export const Guests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [guestOfFilter, setGuestOfFilter] = useState<string>("");

  const { data, isLoading, error } = useGuestsQuery({
    search: searchTerm,
    guest_of: guestOfFilter,
  });

  const filteredGuests = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (guest) =>
          guest.guest_id.toLowerCase().includes(lowerSearch) ||
          guest.english_name.toLowerCase().includes(lowerSearch) ||
          guest.khmer_name.includes(searchTerm)
      );
    }

    if (guestOfFilter) {
      filtered = filtered.filter((guest) => guest.guest_of === guestOfFilter);
    }

    return filtered;
  }, [data, searchTerm, guestOfFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wedding Guests
          </h1>
        </div>

        {/* Apple-Inspired Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          guestOfFilter={guestOfFilter}
          onGuestOfChange={setGuestOfFilter}
        />

        {/* Guests Table */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">
                Error loading guests: {(error as Error).message}
              </p>
            </div>
          ) : (
            <GuestsTable guests={filteredGuests} />
          )}
        </div>
      </div>
    </div>
  );
};
