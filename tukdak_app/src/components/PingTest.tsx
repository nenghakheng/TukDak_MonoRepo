import { usePing, usePingMutation } from "../hooks/usePing";

const PingTest = () => {
  const { data, isLoading, error, refetch } = usePing();
  const mutation = usePingMutation();

  const handleQueryTest = () => {
    refetch();
  };

  const handleMutationTest = () => {
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              API Connection Test
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Testing endpoint: http://localhost:3000/ping
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleQueryTest}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Testing...
                  </span>
                ) : (
                  "🔍 Test with useQuery"
                )}
              </button>

              <button
                onClick={handleMutationTest}
                disabled={mutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Testing...
                  </span>
                ) : (
                  "⚡ Test with useMutation"
                )}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">Loading...</p>
              </div>
            )}

            {/* Error State */}
            {(error || mutation.error) && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-red-800 font-semibold">
                      Error occurred
                    </h3>
                    <p className="text-red-700 mt-2">
                      {(error as Error)?.message ||
                        (mutation.error as Error)?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {(data || mutation.data) && !isLoading && !mutation.isPending && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-green-800 font-semibold text-lg">
                      Connection Successful! 🎉
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-gray-700 font-semibold mb-3">
                    Response Data:
                  </h4>
                  <div className="space-y-3">
                    <DataField
                      label="Greeting"
                      value={(data || mutation.data)?.data.greeting}
                    />
                    <DataField
                      label="Date"
                      value={new Date(
                        (data || mutation.data)?.data.date || ""
                      ).toLocaleString()}
                    />
                    <DataField
                      label="URL"
                      value={(data || mutation.data)?.data.url}
                    />

                    <div className="pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        Headers:
                      </h5>
                      <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                        <pre className="text-xs text-gray-600 font-mono">
                          {JSON.stringify(
                            (data || mutation.data)?.data.headers,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataField = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm font-semibold text-gray-600 sm:w-32">
      {label}:
    </span>
    <span className="text-gray-800 mt-1 sm:mt-0">{value}</span>
  </div>
);

export default PingTest;
