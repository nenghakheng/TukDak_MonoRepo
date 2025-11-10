import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  useGuestsPaginatedQuery,
  useCreateGuestMutation,
} from "../../hooks/useGuest";
import { SearchBar } from "./SearchBar";
import { GuestsTable } from "./GuestsTable";
import { CreateGuestModal } from "./CreateGuestModal";

export const Guests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [guestOfFilter, setGuestOfFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, error } = useGuestsPaginatedQuery({
    page: currentPage,
    limit: 25,
    search: searchTerm,
    guest_of: guestOfFilter,
  });

  const createMutation = useCreateGuestMutation();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateGuest = async (data: {
    english_name: string;
    khmer_name: string;
    amount_khr: number;
    amount_usd: number;
    guest_of: string;
  }) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    setCurrentPage(1); // Go to first page to see new guest
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Wedding Guests
            </h1>
          </div>

          {/* Add Guest Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Guest
          </button>
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

      {/* Create Guest Modal */}
      <CreateGuestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateGuest}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
