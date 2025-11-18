import { useDashboardStats } from "../../hooks/useDashboard";

export const Dashboard = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  console.log("Data: ", stats);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading dashboard statistics</div>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number, currency: "KHR" | "USD") => {
    if (currency === "KHR") {
      return `${amount.toLocaleString()} ៛`;
    }
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getGuestOfLabel = (key: string): string => {
    const labels: Record<string, string> = {
      bride: "Bride",
      groom: "Groom",
      bride_parents: "Bride's Parents",
      groom_parents: "Groom's Parents",
      bride_sibling: "Bride's Sibling",
      groom_sibling: "Groom's Sibling",
    };
    return labels[key] || key;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Wedding Dashboard
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Guests */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Guests
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total_guests}
            </p>
          </div>

          {/* Paid Guests */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Checked-In Guests
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.paid_guests}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {((stats.paid_guests / stats.total_guests) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Pending Guests */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Pending Guests
            </h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending_guests}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {((stats.pending_guests / stats.total_guests) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Duplicates */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Duplicates
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.duplicates}
            </p>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total KHR */}
          <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 dark:from-rose-900/30 dark:to-pink-900/30 backdrop-blur-sm rounded-lg border border-rose-300 dark:border-rose-700 p-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Amount (KHR)
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.total_khr, "KHR")}
            </p>
          </div>

          {/* Total USD */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-sm rounded-lg border border-blue-300 dark:border-blue-700 p-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Amount (USD)
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.total_usd, "USD")}
            </p>
          </div>
        </div>

        {/* Payment Methods & Guest Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Methods
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    QR Code
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {stats.payment_methods.qr_code}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(
                      (stats.payment_methods.qr_code / stats.total_guests) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cash</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {stats.payment_methods.cash}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(
                      (stats.payment_methods.cash / stats.total_guests) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Pending
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {stats.payment_methods.pending}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(
                      (stats.payment_methods.pending / stats.total_guests) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="mt-6">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-purple-500 h-full"
                    style={{
                      width: `${
                        (stats.payment_methods.qr_code / stats.total_guests) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${
                        (stats.payment_methods.cash / stats.total_guests) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500 h-full"
                    style={{
                      width: `${
                        (stats.payment_methods.pending / stats.total_guests) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guest Distribution */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Guest Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.guest_distribution).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded ${
                        key === "bride"
                          ? "bg-pink-500"
                          : key === "groom"
                          ? "bg-blue-500"
                          : key === "bride_parents"
                          ? "bg-purple-500"
                          : key === "groom_parents"
                          ? "bg-indigo-500"
                          : key === "bride_sibling"
                          ? "bg-rose-500"
                          : "bg-cyan-500"
                      }`}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {getGuestOfLabel(key)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((value / stats.total_guests) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}

              {/* Visual Bar */}
              <div className="mt-6">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  {Object.entries(stats.guest_distribution).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className={`h-full ${
                          key === "bride"
                            ? "bg-pink-500"
                            : key === "groom"
                            ? "bg-blue-500"
                            : key === "bride_parents"
                            ? "bg-purple-500"
                            : key === "groom_parents"
                            ? "bg-indigo-500"
                            : key === "bride_sibling"
                            ? "bg-rose-500"
                            : "bg-cyan-500"
                        }`}
                        style={{
                          width: `${(value / stats.total_guests) * 100}%`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
