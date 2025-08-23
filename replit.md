# Cake Shop Order Management System

## Overview

This is a cake shop order management web application designed to streamline order tracking and analysis. The system integrates with Google Sheets as the primary data source, allowing the cake shop owner to manage orders more efficiently without constantly opening spreadsheets. The application provides intuitive order viewing, date-based filtering, search functionality, and automated statistics for various cake attributes (flavors, sizes, designs, etc.).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state and caching
- **Date Handling**: date-fns library for date manipulation and formatting

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Storage**: In-memory storage (MemStorage class) with planned PostgreSQL migration
- **ORM**: Drizzle ORM with PostgreSQL dialect configured
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload via Vite integration in development mode

### Database Schema
The application uses a single `orders` table with the following structure:
- `id`: Primary key (UUID)
- `customerName`: Customer name
- `design`: Cake design specification
- `orderDate` & `pickupDate`: Date fields for order scheduling
- `flavor`, `sheet`, `size`, `cream`: Cake specification attributes
- `requests` & `notes`: Optional text fields for special instructions
- `orderChannel`: Source of the order (네이버예약, 카카오톡, 매장방문)

### Key Features
- **Date Range Selection**: Calendar-based interface for filtering orders by date periods
- **Order Management**: View, search, and filter orders with detailed modal views
- **Statistics Dashboard**: Automated counting and analysis of cake attributes
- **Google Sheets Integration**: Sync functionality to pull data from external spreadsheets
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Development Decisions
- **In-Memory Storage**: Currently using memory storage for rapid development, with Drizzle ORM configured for easy PostgreSQL migration
- **Component Architecture**: Modular React components with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with shared schemas between frontend and backend
- **Development Experience**: Replit-optimized with development banners and error overlays

## External Dependencies

### Core Frameworks & Libraries
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web framework for API routes
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Type safety across the entire application

### UI & Styling
- **Radix UI**: Accessible primitive components for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Data & State Management
- **TanStack Query**: Server state management with caching and synchronization
- **Drizzle ORM**: Type-safe SQL ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL database provider
- **Zod**: Schema validation for type-safe data parsing

### Development & Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development
- **PostCSS**: CSS processing with Autoprefixer

### External Services
- **Google Sheets API**: Integration for importing order data from existing spreadsheets
- **Replit Platform**: Development environment with specialized plugins and deployment support

The application follows a modern full-stack architecture with clear separation between client and server code, shared type definitions, and a focus on developer experience and type safety.