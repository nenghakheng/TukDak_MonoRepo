import { useState } from "react";
import { useGuestsPaginatedQuery } from "../../hooks/useGuest";
import { SearchBar } from "./SearchBar";
import { GuestsTable } from "./GuestsTable";

export const Guests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [guestOfFilter, setGuestOfFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGuestsPaginatedQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    guest_of: guestOfFilter,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wedding Guests
          </h1>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
          guestOfFilter={guestOfFilter}
          onGuestOfChange={(value) => {
            setGuestOfFilter(value);
            setCurrentPage(1); // Reset to page 1 on filter
          }}
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
          ) : data?.data ? (
            <GuestsTable
              guests={data.data.data}
              currentPage={data.data.page}
              totalPages={data.data.totalPages}
              totalGuests={data.data.total}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
