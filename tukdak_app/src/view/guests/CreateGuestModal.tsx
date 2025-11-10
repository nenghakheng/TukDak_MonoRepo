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
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Add New Guest
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new guest entry for the wedding
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* English Name */}
            <div>
              <label
                htmlFor="english_name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Guest Name{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                id="english_name"
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="Enter guest's name"
                required
                className="w-full px-4 py-3 border-2 border-rose-200 dark:border-rose-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none transition-colors text-base placeholder:text-rose-400 dark:placeholder:text-rose-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Full name in English or Khmer
              </p>
            </div>

            {/* Guest Of */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Guest Of{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "Bride",
                    label: "Bride",
                    color:
                      "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50",
                  },
                  {
                    value: "Groom",
                    label: "Groom",
                    color:
                      "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50",
                  },
                  {
                    value: "Bride_Parents",
                    label: "Bride's Parents",
                    color:
                      "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50",
                  },
                  {
                    value: "Groom_Parents",
                    label: "Groom's Parents",
                    color:
                      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGuestOf(option.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      guestOf === option.value
                        ? "ring-2 ring-rose-600 dark:ring-rose-500 ring-offset-2 dark:ring-offset-gray-800 " +
                          option.color
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-rose-50/90 dark:bg-rose-900/20 backdrop-blur-sm border border-rose-200 dark:border-rose-800 rounded-xl p-4 transition-colors">
              <p className="text-xs text-rose-800 dark:text-rose-300">
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
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !englishName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 dark:from-rose-700 dark:to-pink-700 dark:hover:from-rose-800 dark:hover:to-pink-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
