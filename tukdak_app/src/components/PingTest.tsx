/**
 * Ping Test Component
 * Demonstrates clean code approach with separation of concerns
 */
import { usePing, usePingMutation } from "../hooks";
import type { PingData } from "../models";
import "./PingTest.css";

/**
 * Component to display ping data
 */
const PingDataDisplay = ({ data }: { data: PingData }) => {
  return (
    <div className="ping-data">
      <h3>✅ Connection Successful</h3>
      <div className="ping-info">
        <div className="info-item">
          <span className="label">Greeting:</span>
          <span className="value">{data.greeting}</span>
        </div>
        <div className="info-item">
          <span className="label">URL:</span>
          <span className="value">{data.url}</span>
        </div>
        <div className="info-item">
          <span className="label">Date:</span>
          <span className="value">{new Date(data.date).toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="label">Host:</span>
          <span className="value">{data.headers.host}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading state component
 */
const LoadingState = () => (
  <div className="ping-status loading">
    <div className="spinner"></div>
    <p>Testing connection...</p>
  </div>
);

/**
 * Error state component
 */
const ErrorState = ({ error }: { error: Error }) => (
  <div className="ping-status error">
    <h3>❌ Connection Failed</h3>
    <p>{error.message}</p>
  </div>
);

/**
 * Main Ping Test Component
 */
export const PingTest = () => {
  const { data, isLoading, error, refetch, isFetching } = usePing();
  const mutation = usePingMutation();

  const handleTestConnection = () => {
    refetch();
  };

  const handleMutationTest = () => {
    mutation.mutate();
  };

  return (
    <div className="ping-test-container">
      <div className="ping-header">
        <h2>API Connection Test</h2>
        <p className="endpoint">Endpoint: http://localhost:3000/ping</p>
      </div>

      <div className="ping-actions">
        <button
          onClick={handleTestConnection}
          disabled={isLoading || isFetching}
          className="btn btn-primary"
        >
          {isFetching ? "Testing..." : "Test Connection (Query)"}
        </button>
        <button
          onClick={handleMutationTest}
          disabled={mutation.isPending}
          className="btn btn-secondary"
        >
          {mutation.isPending ? "Testing..." : "Test Connection (Mutation)"}
        </button>
      </div>

      <div className="ping-result">
        {isLoading && <LoadingState />}
        {error && <ErrorState error={error as Error} />}
        {data?.success && data.data && <PingDataDisplay data={data.data} />}
        {mutation.isError && <ErrorState error={mutation.error as Error} />}
        {mutation.isSuccess && mutation.data?.success && (
          <div className="mutation-success">
            <p>✅ Mutation successful!</p>
            <PingDataDisplay data={mutation.data.data} />
          </div>
        )}
      </div>

      <div className="ping-footer">
        <small>Using @tanstack/react-query for server state management</small>
      </div>
    </div>
  );
};
