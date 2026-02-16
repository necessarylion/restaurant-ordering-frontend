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
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (radix-lyra style)
- **Icons**: Hugeicons (@hugeicons/react)
- **Font**: Noto Sans Variable

## Project Structure

- `src/components/ui/` - shadcn/ui components (auto-generated, do not modify manually)
- `src/components/` - Custom application components
- `src/lib/` - Shared utilities and helpers
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root application component
- `src/index.css` - Global styles with CSS variables for theming

## Code Conventions

- **Path Aliases**: Use `@/` alias for imports (e.g., `@/components/ui/button`)
- **Component Files**: Use `.tsx` extension for all React components
- **Styling**: Use Tailwind utility classes, leverage CSS variables for theming
- **Icons**: Import from `@hugeicons/react` package

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
