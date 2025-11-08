import { useState } from "react";
import type { Guest } from "../../models";
import { CheckInModal } from "../check-in/CheckInModal";
import { useCheckInGuestMutation } from "../../hooks/useGuest";

interface GuestsTableProps {
  guests: Guest[];
}

export const GuestsTable = ({ guests }: GuestsTableProps) => {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const checkInMutation = useCheckInGuestMutation();

  if (guests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg">No guests found</p>
      </div>
    );
  }

  const getGuestOfColor = (guestOf: string) => {
    const colors: Record<string, string> = {
      Bride: "bg-pink-100 text-pink-800",
      Groom: "bg-blue-100 text-blue-800",
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

  const handleCheckIn = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
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
      setIsModalOpen(false);
      setSelectedGuest(null);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guest ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  English Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Khmer Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guest Of
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount (KHR)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount (USD)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr
                  key={guest.guest_id}
                  className="hover:bg-gray-50 transition-colors"
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
                    <div className="text-sm text-gray-600">
                      {guest.khmer_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGuestOfColor(
                        guest.guest_of
                      )}`}
                    >
                      {guest.guest_of}
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
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-500">
                        Not Checked In
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!guest.payment_method ? (
                      <button
                        onClick={() => handleCheckIn(guest)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-lg">
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

      {/* Check-In Modal */}
      <CheckInModal
        guest={selectedGuest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGuest(null);
        }}
        onCheckIn={handleCheckInSubmit}
        isLoading={checkInMutation.isPending}
      />
    </>
  );
};
