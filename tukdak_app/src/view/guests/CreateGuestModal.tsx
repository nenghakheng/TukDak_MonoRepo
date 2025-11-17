import { useState, useEffect } from "react";
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
    payment_method?: string;
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
  const [currency, setCurrency] = useState<"KHR" | "USD">("KHR");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setEnglishName("");
      setGuestOf("Bride");
      setCurrency("KHR");
      setAmount("");
      setPaymentMethod("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount) || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      english_name: englishName.trim(),
      khmer_name: "N/A",
      amount_khr: currency === "KHR" ? numAmount : 0,
      amount_usd: currency === "USD" ? numAmount : 0,
      guest_of: guestOf,
      payment_method: paymentMethod,
    };

    // Only add payment_method if amount is provided
    if (amount && paymentMethod) {
      data.payment_method = paymentMethod;
    }

    onCreate(data);
  };

  const handleClose = () => {
    setEnglishName("");
    setGuestOf("Bride");
    setCurrency("KHR");
    setAmount("");
    setPaymentMethod("");
    onClose();
  };

  const getGuestOfStyles = (option: string) => {
    const styles: Record<string, string> = {
      Bride: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      Groom: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Bride_Parents:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Groom_Parents:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      Bride_Sibling:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      Groom_Sibling:
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    };
    return styles[option] || styles.Bride;
  };

  const getRingStyles = (option: string) => {
    const rings: Record<string, string> = {
      Bride: "ring-pink-500 dark:ring-pink-400",
      Groom: "ring-blue-500 dark:ring-blue-400",
      Bride_Parents: "ring-purple-500 dark:ring-purple-400",
      Groom_Parents: "ring-indigo-500 dark:ring-indigo-400",
      Bride_Sibling: "ring-rose-500 dark:ring-rose-400",
      Groom_Sibling: "ring-cyan-500 dark:ring-cyan-400",
    };
    return rings[option] || rings.Bride;
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
                <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <input
                id="english_name"
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="Enter guest's name"
                required
                className="w-full px-4 py-3 border-2 border-rose-200 dark:border-rose-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none transition-colors text-base"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Full name in English or Khmer
              </p>
            </div>

            {/* Guest Of */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Guest Of{" "}
                <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "Bride", label: "Bride" },
                  { value: "Groom", label: "Groom" },
                  { value: "Bride_Parents", label: "Bride's Parents" },
                  { value: "Groom_Parents", label: "Groom's Parents" },
                  { value: "Bride_Sibling", label: "Bride's Sibling" },
                  { value: "Groom_Sibling", label: "Groom's Sibling" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGuestOf(option.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      guestOf === option.value
                        ? `${getGuestOfStyles(
                            option.value
                          )} ring-2 ring-offset-2 ${getRingStyles(
                            option.value
                          )} dark:ring-offset-gray-800`
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Payment Information (Optional)
              </h4>

              {/* Currency Toggle */}
              <div className="mb-4">
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
              <div className="mb-4">
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
                    step="any"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 border-2 border-rose-200 dark:border-rose-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none transition-colors text-lg font-semibold"
                  />
                </div>
                {currency === "KHR" && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Suggested amounts: 100,000 / 200,000 / 500,000
                  </p>
                )}
              </div>

              {/* Payment Method - show if amount is entered */}
              {amount && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["QR_Code", "Cash"].map((method) => (
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
              )}

              {/* Info Box */}
              <div className="bg-rose-50/90 dark:bg-rose-900/20 backdrop-blur-sm border border-rose-200 dark:border-rose-800 rounded-xl p-4 transition-colors">
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  <span className="font-semibold">💡 Tip:</span> Payment details
                  can be added now or later during check-in. The guest will be
                  created with pending status if no payment is provided.
                </p>
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
                disabled={
                  isLoading ||
                  !englishName.trim() ||
                  (!!amount && !paymentMethod)
                }
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
