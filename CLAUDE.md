# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 3000)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

## Environment Setup

This app requires a `GEMINI_API_KEY` environment variable set in `.env.local` to function properly.

## Project Architecture

This is a React + TypeScript home healthcare management application built with Vite. The app uses Arabic text and right-to-left (RTL) layouts in many components.

### Core Structure

- **Context Management**: Centralized state using React Context (`context/HomeHealthcareContext.tsx`)
- **Type System**: Comprehensive TypeScript definitions in `types.ts` for all domain entities
- **Data Layer**: Static data initialization from `data.ts` with Arabic staff and patient information

### Key Components

- **Role-based Views**: Different interfaces for Doctor, Nurse, Physical Therapist, Social Worker, Driver, and Coordinator roles
- **Assessment Forms**: Specialized forms for each healthcare role (`components/forms/`)
- **Visit Management**: Scheduling and tracking patient visits with team assignments
- **Print Views**: Dedicated print-optimized components for various document types

### State Management

The app uses a reducer pattern with the following key state:
- Patient data with Arabic names and healthcare details
- Staff information and team assignments
- Visit scheduling and assessment tracking
- Role-based filtering and selection
- Custom patient lists

### Data Model

Core entities include:
- **Patient**: Contains Arabic name, national ID, medical status, and assessment history
- **Staff**: Healthcare team members with Arabic names and specializations
- **Assessment**: Role-specific medical assessments (Doctor, Nurse, PT, SW)
- **Visit**: Scheduled patient visits with team assignments and completion status

### Healthcare Workflow

The application supports a complete home healthcare workflow:
1. Patient admission with initial assessments
2. Team assignment and visit scheduling
3. Role-specific follow-up assessments during visits
4. Progress tracking and documentation
5. Print-ready reports for various stakeholders

### Key Features

- **Multilingual Support**: Arabic UI elements and patient data
- **Risk Assessment**: Braden scores, fall risk, wound tracking
- **Medical Devices**: Catheter, feeding tube, IV therapy management
- **Critical Cases**: Special handling for high-risk patients
- **Contact Tracking**: Failed visit attempts and patient communication

### File Organization

- `/components/` - Main UI components
- `/components/forms/` - Role-specific assessment forms organized by role
- `/context/` - React Context providers
- `/utils/` - Helper functions and data processing
- `types.ts` - Complete TypeScript definitions
- `data.ts` - Static Arabic healthcare data

The codebase follows React functional component patterns with hooks and maintains strict TypeScript typing throughout.