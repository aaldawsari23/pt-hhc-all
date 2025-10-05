# Architecture Overview

## Home Healthcare Management System Architecture

### System Overview
The Home Healthcare Management System is a React-based TypeScript application designed for healthcare professionals to manage patient care, assessments, and documentation in a home healthcare setting.

## Core Architecture

### Role Management
The system is built around 5 primary healthcare roles:
- **Doctor (طبيب)**: Medical assessments and treatment decisions
- **Nurse (ممرض)**: Patient care, vital signs, and medical procedures  
- **Physical Therapist (علاج طبيعي)**: Rehabilitation and mobility assessments
- **Social Worker (اجتماعي)**: Social support and resource coordination
- **Driver (سائق)**: Transportation and logistics

**Source Location**: `types.ts:224-230`

### Patient Management
Patient data is centrally managed through the HomeHealthcare context with the following workflow:

1. **Patient Creation**: `components/AddPatientModal.tsx`
   - Validation for National ID uniqueness
   - Medical device and condition tracking
   - Real-time form validation

2. **Patient Display**: `components/PatientCard.tsx`
   - Organized action groups (Communication, Records, Assessment, Print)
   - Role-based action visibility
   - Mobile-optimized touch targets

3. **Patient List**: `components/PatientList.tsx`  
   - Search and filtering capabilities
   - Responsive grid layout
   - Add patient functionality

**Data Flow**: `context/HomeHealthcareContext.tsx` → `components/PatientList.tsx` → `components/PatientCard.tsx`

### Assessment System
Multi-role assessment workflow with manual staff selection:

1. **Assessment Forms**: `components/forms/[role]/`
   - Role-specific assessment forms
   - Manual doctor/nurse selection via `EnhancedAssessmentHeader.tsx`
   - Real-time validation and auto-save

2. **Staff Selection**: 
   - Dynamic filtering by role (طبيب/ممرض)
   - Dropdown selection with search
   - Assessment team tracking

3. **Assessment Storage**:
   - Linked to patient records
   - Timestamped with assessor information
   - Role-based access controls

### Print System Architecture

**Print Components**:
- `components/EnhancedPrintManager.tsx`: Main print interface
- `styles/print-styles.css`: A4-optimized print CSS
- Support for Arabic text with proper RTL layout

**Print Features**:
- A4 page formatting (794px width, safe margins)
- Professional medical document headers
- Arabic font support with Traditional Arabic font family
- Color-accurate printing with `print-color-adjust: exact`
- Page break management for multi-page documents

**Print Workflow**:
```
User Action → Print Manager → Document Selection → CSS Application → Browser Print
```

## Data Architecture

### State Management
**Primary Store**: React Context (`HomeHealthcareContext.tsx`)
```typescript
interface AppState {
  patients: Patient[]
  staff: Staff[]
  currentRole: Role
  visits: Visit[]
  teams: Team[]
  // ... other state
}
```

### Data Sources
1. **Static Data**: `data.ts` - Staff and patient seed data
2. **Real-time State**: React Context with useReducer
3. **Local Storage**: Form drafts and user preferences

### Type System
**Core Types** (`types.ts`):
- `Patient`: Complete patient medical record
- `Staff`: Healthcare team member information  
- `Assessment`: Role-specific assessment data
- `Visit`: Scheduled patient visits
- `Role`: Enumerated healthcare roles

## Component Architecture

### Component Hierarchy
```
App.tsx
├── HomeHealthcareProvider (Context)
├── Header.tsx (Role selection, navigation)
├── PatientList.tsx
│   ├── AddPatientModal.tsx
│   └── PatientCard.tsx
│       ├── EnhancedContactManager.tsx
│       ├── EnhancedPrintManager.tsx
│       ├── PatientHistory.tsx
│       └── SmartAssessmentSelector.tsx
└── Assessment Forms (role-specific)
    └── EnhancedAssessmentHeader.tsx
```

### Key Component Patterns
1. **Container/Presenter**: Smart components fetch data, presenters display
2. **Compound Components**: Modal systems with multiple sub-components
3. **Render Props**: Flexible data sharing between components
4. **Context Providers**: Global state management

## Mobile-First Architecture

### Performance Optimizations
1. **Hardware Acceleration**: GPU-accelerated animations
2. **Touch Targets**: 44px minimum touch target size
3. **Responsive Grids**: CSS Grid with mobile-first breakpoints
4. **Lazy Loading**: Component-level code splitting

### CSS Architecture
```
index.css (base styles)
├── styles/print-styles.css (A4 print formatting)
├── styles/mobile-optimizations.css (mobile performance)
└── Component-level styles (scoped CSS modules)
```

### Mobile Features
- Touch-friendly button interactions
- Swipe gestures for navigation
- Viewport meta tag optimization
- Safe area support for notched devices

## Print Architecture

### Print System Components
1. **Print Manager**: Document type selection and preview
2. **Print Headers**: Professional medical document headers
3. **Print Styles**: A4-optimized CSS with Arabic support
4. **Content Formatters**: Role-specific content formatting

### A4 Print Standards
- **Page Size**: 210mm x 297mm (A4)
- **Margins**: 10-12mm safe margins
- **Fonts**: Arial for English, Traditional Arabic for Arabic text
- **Colors**: Exact color reproduction with `print-color-adjust`

### Print Workflow
```
Document Selection → Content Formatting → CSS Application → Print Preview → Final Print
```

## Security & Access Control

### Role-Based Access
- Component-level role checking
- Action visibility based on current role
- Assessment form access controls

### Data Validation
- Real-time form validation
- Type-safe data structures
- Input sanitization and validation

## Internationalization (i18n)

### Arabic Support
- RTL layout support
- Arabic font rendering
- Bilingual labels (English/Arabic)
- Cultural date formatting

### Implementation
- CSS `direction: rtl` for Arabic content
- Font family stacks with Arabic fonts
- Proper text alignment for mixed content

## Performance Monitoring

### Metrics Tracked
- Component render times
- Form submission performance
- Print generation speed
- Mobile interaction latency

### Optimization Strategies
- Component memoization with React.memo
- Callback optimization with useCallback
- Effect dependency optimization
- Hardware acceleration for animations

## Future Architecture Considerations

### Backend Integration
- API layer design for patient data
- Real-time updates with WebSocket
- Offline functionality with service workers
- Data synchronization strategies

### Scalability
- Component lazy loading
- Virtual scrolling for large lists
- Progressive Web App (PWA) capabilities
- Micro-frontend architecture potential

## Development Workflow

### Code Organization
```
src/
├── components/          # UI components
├── context/            # React context providers  
├── types.ts           # TypeScript definitions
├── data.ts            # Static data
├── utils/             # Helper functions
├── styles/            # CSS stylesheets
└── services/          # API and external services
```

### Build Process
- Vite for fast development builds
- TypeScript compilation
- CSS optimization and purging
- Progressive enhancement for older browsers

This architecture provides a solid foundation for a scalable, maintainable healthcare management system with strong mobile support and professional print capabilities.