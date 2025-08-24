# Overview

SheetSync is a React-based dashboard application for managing and analyzing cake order data from Google Sheets. The application provides a clean interface for viewing order details, filtering by date ranges and channels, and displaying comprehensive statistics about order patterns. It directly integrates with the Google Sheets API to fetch real-time data and present it in an organized, user-friendly format.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React stack with TypeScript, built using Vite for fast development and optimized production builds. The component architecture follows a clean separation of concerns:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with a comprehensive design system using CSS custom properties
- **Component Library**: Radix UI primitives with custom styled components in the `ui/` directory
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching

## Data Flow and State Management
The application implements a unidirectional data flow pattern:

- **Server State**: React Query handles all API calls, caching, and background refetching
- **Local State**: React hooks manage component-level state for UI interactions
- **Settings Storage**: localStorage for persisting Google Sheets configuration

## Google Sheets Integration
The application directly integrates with Google Sheets API without a traditional backend:

- **Direct API Access**: Uses Google Sheets API v4 with API key authentication
- **Configuration Management**: Stores API keys, sheet IDs, and sheet names in localStorage
- **Data Transformation**: Converts Google Sheets row data to typed Order objects
- **Real-time Sync**: Provides manual sync functionality to fetch latest data

## Component Architecture
The application follows a feature-based component organization:

- **Pages**: Top-level route components (`home`, `not-found`)
- **Feature Components**: Domain-specific components for orders, statistics, and date selection
- **UI Components**: Reusable design system components based on Radix UI
- **Layout Components**: Header and structural components

## Type Safety and Schema
The application uses a robust typing system:

- **Drizzle Schema**: Defines database schema and types for orders
- **Zod Validation**: Runtime validation for Google Sheets data transformation
- **TypeScript Types**: Comprehensive type definitions for all data structures

## Design System
The UI implements a cohesive design system with:

- **CSS Custom Properties**: Centralized theming with semantic color tokens
- **Component Variants**: Class variance authority for consistent component styling
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Accessibility**: Radix UI primitives ensure WCAG compliance

# External Dependencies

## Google Services
- **Google Sheets API v4**: For fetching order data directly from spreadsheets
- **Google Fonts**: Custom font loading for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)

## Core Libraries
- **React Query**: Server state management, caching, and background synchronization
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, and form controls
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Wouter**: Lightweight routing solution
- **Framer Motion**: Animation library for enhanced user interactions

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **Drizzle ORM**: Database schema definition and type generation (prepared for future backend integration)

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class composition
- **class-variance-authority**: Type-safe component variant management
- **Lucide React**: Icon library for consistent iconography

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

The application is designed to be easily extensible with a future backend while currently operating as a frontend-only solution that directly interfaces with Google Sheets for data management.