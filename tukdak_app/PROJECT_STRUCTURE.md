# TukDak App - Project Structure

## 📁 Architecture Overview

This project follows a **clean architecture** approach with clear separation of concerns across distinct layers.

### Layer Structure

```
src/
├── api/                  # API Layer - External communication
│   ├── client.ts        # Axios configuration & HTTP methods
│   ├── config.ts        # API configuration & endpoints
│   ├── api.tsx          # API service definitions
│   └── index.ts         # Public API exports
│
├── models/              # Data Models - Type definitions
│   ├── ping.model.ts    # Ping-related types
│   └── index.ts         # Model exports
│
├── hooks/               # Custom React Hooks - Business logic
│   ├── usePing.ts       # Ping API hooks with react-query
│   └── index.ts         # Hook exports
│
├── components/          # UI Components - Presentation
│   ├── PingTest.tsx     # Ping test component
│   ├── PingTest.css     # Component styles
│   └── index.ts         # Component exports
│
├── assets/              # Static assets
├── App.tsx              # Main application component
├── App.css              # Application styles
├── main.tsx             # Entry point with providers
└── index.css            # Global styles
```

## 🏗️ Layer Responsibilities

### 1. API Layer (`src/api/`)
- **Purpose**: Handle all external API communication
- **Files**:
  - `client.ts`: Axios instance with interceptors
  - `config.ts`: Base URLs, endpoints, and configuration
  - `api.tsx`: API service methods (GET, POST, PUT, PATCH, DELETE)

**Example**:
```typescript
// api.tsx
export const pingApi = {
  ping: async (): Promise<PingResponse> => {
    return ApiService.get<PingResponse>(API_ENDPOINTS.PING);
  },
};
```

### 2. Models Layer (`src/models/`)
- **Purpose**: Type definitions and data structures
- **Files**:
  - `ping.model.ts`: Types for ping API responses

**Example**:
```typescript
export interface PingResponse {
  success: boolean;
  data: PingData;
}
```

### 3. Hooks Layer (`src/hooks/`)
- **Purpose**: Business logic and server state management
- **Uses**: `@tanstack/react-query` for data fetching and caching
- **Files**:
  - `usePing.ts`: Custom hooks for ping operations

**Example**:
```typescript
export const usePing = () => {
  return useQuery({
    queryKey: pingQueryKeys.detail(),
    queryFn: () => api.ping.ping(),
    staleTime: 5000,
    retry: 2,
  });
};
```

### 4. Components Layer (`src/components/`)
- **Purpose**: UI presentation and user interaction
- **Principle**: Components should be "dumb" - they receive data and callbacks via props
- **Files**:
  - `PingTest.tsx`: Main ping test component
  - `PingTest.css`: Component-specific styles

## 🔧 Available HTTP Methods

The `ApiService` class provides all standard HTTP methods:

```typescript
ApiService.get<T>(url, config?)
ApiService.post<T, D>(url, data?, config?)
ApiService.put<T, D>(url, data?, config?)
ApiService.patch<T, D>(url, data?, config?)
ApiService.delete<T>(url, config?)
```

## 🎯 React Query Integration

### useQuery - For GET requests
```typescript
const { data, isLoading, error, refetch } = usePing();
```

### useMutation - For POST/PUT/DELETE
```typescript
const mutation = usePingMutation();
mutation.mutate();
```

### useQueryClient - For cache management
```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: pingQueryKeys.all });
```

## 🚀 Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Test API connection**:
   - Ensure your backend is running at `http://localhost:3000`
   - Click "Test Connection" button in the UI

## 🎨 Clean Code Principles Applied

1. **Single Responsibility**: Each layer has one clear purpose
2. **Separation of Concerns**: UI, business logic, and API calls are separated
3. **DRY (Don't Repeat Yourself)**: Reusable API service and hooks
4. **Type Safety**: Full TypeScript typing across all layers
5. **Consistent Export Pattern**: Each folder has an index.ts for clean imports

## 📝 Adding New API Endpoints

1. **Add endpoint to config**:
```typescript
// api/config.ts
export const API_ENDPOINTS = {
  PING: '/ping',
  USERS: '/users', // New endpoint
};
```

2. **Define model**:
```typescript
// models/user.model.ts
export interface User {
  id: string;
  name: string;
}
```

3. **Create API service**:
```typescript
// api/api.tsx
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    return ApiService.get<User[]>(API_ENDPOINTS.USERS);
  },
};
```

4. **Create custom hook**:
```typescript
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.user.getUsers(),
  });
};
```

5. **Use in component**:
```typescript
// components/UserList.tsx
const { data: users } = useUsers();
```

## 🔍 Features

- ✅ Clean layered architecture
- ✅ Type-safe API calls with Axios
- ✅ Server state management with React Query
- ✅ Automatic request/response interceptors
- ✅ Error handling
- ✅ Loading states
- ✅ Mutation support
- ✅ Cache invalidation
- ✅ Responsive UI design

## 📦 Dependencies

- **axios**: HTTP client for API calls
- **@tanstack/react-query**: Server state management
- **react**: UI framework
- **typescript**: Type safety
- **vite**: Build tool
