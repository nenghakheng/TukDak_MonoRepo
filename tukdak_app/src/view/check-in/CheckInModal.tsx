import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Guest } from "../../models";

interface CheckInModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (data: {
    guest_id: string;
    amount_khr: number;
    amount_usd: number;
    payment_method: string;
  }) => void;
  isLoading?: boolean;
}

export const CheckInModal = ({
  guest,
  isOpen,
  onClose,
  onCheckIn,
  isLoading = false,
}: CheckInModalProps) => {
  const [currency, setCurrency] = useState<"KHR" | "USD">("KHR");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("QR_Code");

  if (!isOpen || !guest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount) || 0;

    onCheckIn({
      guest_id: guest.guest_id,
      amount_khr: currency === "KHR" ? numAmount : 0,
      amount_usd: currency === "USD" ? numAmount : 0,
      payment_method: paymentMethod,
    });
  };

  const handleClose = () => {
    setAmount("");
    setCurrency("KHR");
    setPaymentMethod("QR_Code");
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
              Check-In Guest
            </h2>
          </div>

          {/* Guest Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 transition-colors">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Guest ID
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {guest.guest_id}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  English Name
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {guest.english_name}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Khmer Name
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {guest.khmer_name}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Guest Of
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    guest.guest_of === "Bride"
                      ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {guest.guest_of}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Currency Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Currency
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency("KHR")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    currency === "KHR"
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md dark:from-rose-700 dark:to-pink-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  }`}
                >
                  KHR (៛)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    currency === "USD"
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md dark:from-rose-700 dark:to-pink-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                  {currency === "KHR" ? "៛" : "$"}
                </span>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step={currency === "KHR" ? "1000" : "0.01"}
                  min="0"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-rose-200 dark:border-rose-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none transition-colors text-lg font-semibold"
                />
              </div>
              {currency === "KHR" && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Suggested amounts: 100,000 / 200,000 / 500,000
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["QR_Code", "Cash", "Bank_Transfer"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      paymentMethod === method
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md dark:from-emerald-700 dark:to-green-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    }`}
                  >
                    {method.replace("_", " ")}
                  </button>
                ))}
              </div>
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
                disabled={isLoading || !amount}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 dark:from-rose-700 dark:to-pink-700 dark:hover:from-rose-800 dark:hover:to-pink-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Check In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
