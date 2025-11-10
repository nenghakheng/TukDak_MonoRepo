import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Guest } from "../../models";
import { CheckInModal } from "../check-in/CheckInModal";
import { UpdateGuestModal } from "./UpdateGuestModal";
import {
  useCheckInGuestMutation,
  useUpdateGuestMutation,
} from "../../hooks/useGuest";

interface GuestsTableProps {
  guests: Guest[];
  currentPage: number;
  totalPages: number;
  totalGuests: number;
  onPageChange: (page: number) => void;
}

type SortField = keyof Guest;
type SortDirection = "asc" | "desc";

export const GuestsTable = ({
  guests,
  currentPage,
  totalPages,
  totalGuests,
  onPageChange,
}: GuestsTableProps) => {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [jumpToPage, setJumpToPage] = useState<string>("");
  const checkInMutation = useCheckInGuestMutation();
  const updateMutation = useUpdateGuestMutation();

  // Sorting logic (client-side for current page)
  const sortedGuests = useMemo(() => {
    const sorted = [...guests].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return 0;
    });

    return sorted;
  }, [guests, sortField, sortDirection]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getGuestOfColor = (guestOf: string) => {
    const colors: Record<string, string> = {
      Bride: "bg-pink-100 text-pink-800",
      Groom: "bg-blue-100 text-blue-800",
      Bride_Parents: "bg-purple-100 text-purple-800",
      Groom_Parents: "bg-indigo-100 text-indigo-800",
    };
    return colors[guestOf] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number, currency: "KHR" | "USD") => {
    if (currency === "KHR") {
      return new Intl.NumberFormat("km-KH", {
        style: "currency",
        currency: "KHR",
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleRowClick = (guest: Guest, e: React.MouseEvent) => {
    // Don't open modal if clicking on the check-in button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    // Only allow update if guest is already checked in
    if (guest.payment_method) {
      setSelectedGuest(guest);
      setIsUpdateModalOpen(true);
    }
  };

  const handleCheckIn = (guest: Guest, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGuest(guest);
    setIsCheckInModalOpen(true);
  };

  const handleCheckInSubmit = async (data: {
    guest_id: string;
    amount_khr: number;
    amount_usd: number;
    payment_method: string;
  }) => {
    try {
      await checkInMutation.mutateAsync({
        guest_id: data.guest_id,
        data: {
          amount_khr: data.amount_khr,
          amount_usd: data.amount_usd,
          payment_method: data.payment_method,
        },
      });
      setIsCheckInModalOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const handleUpdateSubmit = async (data: {
    guest_id: string;
    amount_khr: number;
    amount_usd: number;
    payment_method: string;
  }) => {
    try {
      await updateMutation.mutateAsync({
        id: data.guest_id,
        data: {
          amount_khr: data.amount_khr,
          amount_usd: data.amount_usd,
          payment_method: data.payment_method,
        },
      });
      setIsUpdateModalOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage("");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  // Calculate showing range
  const itemsPerPage = 10;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalGuests);

  if (guests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg">No guests found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    onClick={() => handleSort("guest_id")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Guest ID <SortIcon field="guest_id" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("english_name")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Name <SortIcon field="english_name" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("guest_of")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Guest Of <SortIcon field="guest_of" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("amount_khr")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Amount KHR <SortIcon field="amount_khr" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("amount_usd")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Amount USD <SortIcon field="amount_usd" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("payment_method")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  >
                    <div className="flex items-center">
                      Payment Method <SortIcon field="payment_method" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGuests.map((guest, index) => (
                  <tr
                    key={guest.guest_id}
                    onClick={(e) => handleRowClick(guest, e)}
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } ${
                      guest.payment_method
                        ? "cursor-pointer hover:bg-blue-50"
                        : "cursor-default"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.guest_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.english_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGuestOfColor(
                          guest.guest_of || ""
                        )}`}
                      >
                        {guest.guest_of
                          ? guest.guest_of.replace(/_/g, " ")
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(guest.amount_khr, "KHR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(guest.amount_usd, "USD")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.payment_method ? (
                        <div className="px-2 py-1 inline-flex text-xs font-semibold rounded-full text-gray-600 bg-gray-100">
                          {guest.payment_method.replace(/_/g, " ")}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!guest.payment_method ? (
                        <button
                          onClick={(e) => handleCheckIn(guest, e)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-lg inline-block">
                          Checked In
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Showing <span className="font-semibold">{startItem}</span> to{" "}
                <span className="font-semibold">{endItem}</span> of{" "}
                <span className="font-semibold">{totalGuests}</span> guests
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Previous
              </button>

              <span className="text-sm font-medium text-gray-700">
                Page <span className="font-bold">{currentPage}</span> of{" "}
                <span className="font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>

              <form
                onSubmit={handleJumpToPage}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-gray-600">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  placeholder={currentPage.toString()}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Go
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Check-In Modal */}
      <CheckInModal
        guest={selectedGuest}
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setSelectedGuest(null);
        }}
        onCheckIn={handleCheckInSubmit}
        isLoading={checkInMutation.isPending}
      />

      {/* Update Guest Modal */}
      <UpdateGuestModal
        guest={selectedGuest}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedGuest(null);
        }}
        onUpdate={handleUpdateSubmit}
        isLoading={updateMutation.isPending}
      />
    </>
  );
};
