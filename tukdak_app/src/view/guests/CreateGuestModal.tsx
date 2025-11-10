import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    english_name: string;
    khmer_name: string;
    amount_khr: number;
    amount_usd: number;
    guest_of: string;
  }) => void;
  isLoading?: boolean;
}

export const CreateGuestModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateGuestModalProps) => {
  const [englishName, setEnglishName] = useState<string>("");
  const [guestOf, setGuestOf] = useState<string>("Bride");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreate({
      english_name: englishName.trim(),
      khmer_name: "N/A",
      amount_khr: 0,
      amount_usd: 0,
      guest_of: guestOf,
    });
  };

  const handleClose = () => {
    setEnglishName("");
    setGuestOf("Bride");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add New Guest
            </h2>
            <p className="text-sm text-gray-600">
              Create a new guest entry for the wedding
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* English Name */}
            <div>
              <label
                htmlFor="english_name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Guest Name <span className="text-red-500">*</span>
              </label>
              <input
                id="english_name"
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="Enter guest's name"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
              <p className="mt-1 text-xs text-gray-500">
                Full name in English or Khmer
              </p>
            </div>

            {/* Guest Of */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Guest Of <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "Bride",
                    label: "Bride",
                    color: "bg-pink-100 text-pink-800 hover:bg-pink-200",
                  },
                  {
                    value: "Groom",
                    label: "Groom",
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                  },
                  {
                    value: "Bride_Parents",
                    label: "Bride's Parents",
                    color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
                  },
                  {
                    value: "Groom_Parents",
                    label: "Groom's Parents",
                    color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGuestOf(option.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      guestOf === option.value
                        ? "ring-2 ring-blue-600 ring-offset-2 " + option.color
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Note:</span> Payment details can
                be added later during check-in. The guest will be created with
                pending status.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !englishName.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </span>
                ) : (
                  "Create Guest"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
