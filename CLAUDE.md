# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant ordering frontend application built with React 19, TypeScript, and Vite. Uses shadcn/ui component library (radix-lyra style) with Tailwind CSS v4.

## Development Commands

- `bun dev` - Start development server
- `bun build` - Build for production (TypeScript check + Vite build)
- `bun lint` - Run ESLint
- `bun preview` - Preview production build

## Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Routing**: React Router v7
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (radix-lyra style)
- **Icons**: Hugeicons (@hugeicons/react)
- **Font**: Noto Sans Variable

## Project Structure

- `src/pages/` - Route components (one per URL)
- `src/layouts/` - Shared layouts (Auth, Dashboard, Guest)
- `src/components/ui/` - shadcn/ui components (auto-generated, do not modify manually)
- `src/components/` - Custom application components (grouped by domain)
- `src/lib/api/` - HTTP client, endpoints, upload utilities
- `src/lib/` - Shared utilities and validation schemas
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand stores (Auth, Restaurant, Cart, AlertDialog)
- `src/types/` - TypeScript type definitions
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root application component with routing
- `src/index.css` - Global styles with CSS variables for theming

## Code Conventions

- **Path Aliases**: Use `@/` alias for imports (e.g., `@/components/ui/button`)
- **Component Files**: Use `.tsx` extension for all React components
- **Styling**: Use Tailwind utility classes, leverage CSS variables for theming
- **Icons**: Import from `@hugeicons/react` package
- **API Calls**: Use type-safe api client from `@/lib/api/client`
- **Forms**: Use react-hook-form with zodResolver for validation
- **Type Safety**: No `any` types - use proper TypeScript types from `@/types`

## shadcn/ui Configuration

- **Style**: radix-lyra
- **Base Color**: gray
- **Icon Library**: hugeicons
- **CSS Variables**: Enabled for theming
- **Adding Components**: Use `bunx shadcn add <component-name>` to add new shadcn components

## Theming

The app supports dark mode via `.dark` class. CSS variables are defined in `src/index.css`:
- Light theme: Uses `:root` variables
- Dark theme: Uses `.dark` class variables
- Custom theme colors: primary, secondary, muted, accent, destructive, etc.

## API Integration

- **Base URL**: Set `VITE_API_BASE_URL` in `.env.local`
- **Authentication**: JWT bearer token stored in localStorage
- **API Client**: `src/lib/api/client.ts` with automatic token injection
- **Endpoints**: Centralized in `src/lib/api/endpoints.ts`
- **Error Handling**: Automatic 401 handling with token refresh
- **Type Safety**: All API calls use TypeScript generics

## State Management

- **Server State**: React Query handles all server data (caching, refetching)
- **Client State**: Zustand stores (`src/stores/`)
  - `authStore` - User authentication state and methods
  - `restaurantStore` - Current restaurant selection with localStorage persistence
  - `cartStore` - Guest ordering cart (session-only)
  - `alertDialogStore` - Global confirm/alert dialog state
- **Hooks**: `useAuth()`, `useRestaurant()`, `useCart()`, `useAlertDialog()` in `src/hooks/`
