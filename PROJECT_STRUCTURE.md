# SurveyDU Project Structure

## App Directory Structure
```
app/
├── auth/                         # Authentication pages
│   ├── signin/                   # Sign in page
│   ├── forgot-password/          # Password reset
│   ├── registration-success/     # Registration success
│   ├── complete-profile/         # Profile completion
│   └── student/
│       └── signup/               # Student registration
├── dashboard/                    # Dashboard routes by role
│   ├── student/                  # Student dashboard
│   │   ├── page.tsx             # Main student dashboard
│   │   ├── profile/             # Student profile management
│   │   ├── participation-history/ # Survey participation history
│   │   ├── points-history/      # Points transaction history
│   │   └── survey/
│   │       └── [id]/            # Survey participation
│   ├── teacher/                  # Teacher dashboard
│   │   ├── page.tsx             # Main teacher dashboard
│   │   ├── profile/             # Teacher profile management
│   │   ├── create-survey/       # Survey creation
│   │   └── survey/
│   │       ├── [id]/            # Survey management
│   │       │   ├── page.tsx     # Survey view
│   │       │   ├── edit/        # Survey editing
│   │       │   └── statistics/  # Survey analytics
│   │       └── participation/
│   │           └── [id]/        # Survey participation view
│   └── admin/                    # Admin dashboard
│       ├── page.tsx             # Main admin dashboard
│       ├── profile/             # Admin profile management
│       ├── users/               # User management
│       ├── departments/         # Department management
│       ├── create-survey/       # Admin survey creation
│       ├── all-surveys/         # All surveys management
│       └── survey/
│           ├── [id]/            # Admin survey management
│           │   ├── page.tsx     # Survey view
│           │   ├── edit/        # Survey editing
│           │   └── statistics/  # Survey analytics
│           └── participation/
│               └── [id]/        # Survey participation view
├── home/                        # Alternative home page
├── home2/                       # Secondary home page
├── layout.tsx                   # Root layout with i18n
├── page.tsx                     # Main landing page
└── globals.css                  # Global styles with RTL support

## Components Directory Structure
components/
├── auth/                        # Authentication components
│   ├── CompleteProfilePage.tsx  # Profile completion form
│   ├── forgot-password.tsx     # Password reset form
│   ├── GoogleLogin.tsx         # Google OAuth integration
│   ├── registration-success.tsx # Registration success page
│   ├── signin.tsx              # Sign in form
│   └── student-signup.tsx      # Student registration form
├── dashboard/                   # Dashboard components
│   ├── surveys/                 # Survey management components
│   │   ├── admin-survey-creator.tsx    # Admin survey creation
│   │   ├── admin-survey-statistics.tsx # Admin survey analytics
│   │   ├── admin-survey-view.tsx       # Admin survey view
│   │   ├── all-surveys.tsx             # All surveys listing
│   │   ├── survey-creator.tsx          # Teacher survey creation
│   │   ├── survey-participation.tsx    # Survey participation
│   │   ├── survey-statistics.tsx       # Survey analytics
│   │   └── survey-view.tsx             # Survey view
│   ├── admin-dashboard.tsx      # Admin dashboard main
│   ├── department-management.tsx # Department management
│   ├── participation-history.tsx # Student participation history
│   ├── points-history.tsx       # Student points history
│   ├── student-dashboard.tsx    # Student dashboard main
│   ├── teacher-dashboard.tsx    # Teacher dashboard main
│   └── user-management.tsx      # User management
├── profile/                     # Profile management components
│   ├── admin-profile.tsx        # Admin profile form
│   ├── student-profile.tsx      # Student profile form
│   └── teacher-profile.tsx      # Teacher profile form
├── question-types/              # Survey question components
│   ├── MultipleChoice.tsx       # Multiple choice question
│   ├── OpenText.tsx            # Open text question
│   ├── ParticipationMultipleChoice.tsx # Participation multiple choice
│   ├── ParticipationOpenText.tsx       # Participation open text
│   ├── ParticipationPercentage.tsx     # Participation percentage
│   ├── ParticipationSingleAnswer.tsx   # Participation single answer
│   ├── Percentage.tsx          # Percentage question
│   └── SingleAnswer.tsx        # Single answer question
├── ui/                         # UI components (shadcn/ui + custom)
│   ├── language-switcher.tsx   # Language switching component
│   ├── locale-provider.tsx     # Locale context provider
│   ├── GlobalPreloader.tsx     # Global loading component
│   ├── LoaderContext.tsx       # Loader context
│   ├── RoutePreloader.tsx      # Route loading component
│   └── [other shadcn/ui components]
├── dashboard-layout.tsx         # Dashboard layout with navigation
└── theme-provider.tsx          # Theme context provider

## Lib Directory Structure
lib/
├── api/                        # API configuration
│   └── axios.ts               # Axios client with interceptors
├── config/                     # Application configuration
│   └── api.ts                 # API endpoints configuration
├── constants/                  # Application constants
│   ├── departments.ts         # Department constants
│   ├── question-types.ts      # Question type definitions
│   └── survey-status.ts       # Survey status constants
├── services/                   # API service layers
│   ├── auth-service.ts        # Authentication services
│   ├── department-service.ts  # Department management services
│   ├── survey-service.ts      # Survey management services
│   └── user-service.ts        # User management services
├── types/                      # TypeScript type definitions
│   ├── auth.ts               # Authentication types
│   ├── department.ts         # Department types
│   ├── survey.ts             # Survey types
│   └── user.ts               # User types
└── utils/                      # Utility functions
    └── cn.ts                  # Class name utility

## Public Directory Structure
public/
├── Images/                    # Static images
│   └── what-is-a-questionnaire-blog-image-1024x618.jpg
├── locales/                   # Translation files
│   ├── en/                   # English translations
│   │   └── common.json       # English translation keys
│   └── ar/                   # Arabic translations
│       └── common.json       # Arabic translation keys
├── placeholder-logo.png       # Placeholder logo image
└── placeholder-logo.svg       # Placeholder logo SVG

## Hooks Directory Structure
hooks/
└── useTranslation.ts         # Custom translation hook

## Internationalization (i18n) Structure

### Translation System
- Custom i18n implementation with English/Arabic support
- Translation files in `public/locales/[locale]/common.json`
- RTL (Right-to-Left) layout support for Arabic
- Dynamic language switching without page reload
- Contextual translations organized by feature areas

### Translation Keys Organization
```
common.json
├── common.*                  # Common UI elements
├── navigation.*              # Navigation items
├── auth.*                   # Authentication pages
├── dashboard.*              # Dashboard components
├── surveys.*                # Survey management
├── profile.*                # Profile management
├── statistics.*             # Analytics and statistics
├── points.*                 # Points system
└── errors.*                 # Error messages
```

### RTL Support Features
- Conditional CSS classes for Arabic layout
- Proper text alignment and direction
- Icon positioning adjustments
- Form layout adaptations
- Navigation menu RTL support

## Key Features by Role

### Student Features
- Browse and participate in available surveys
- Earn and track points for survey participation
- View detailed participation history
- Manage profile with academic information
- Mobile-optimized survey participation
- RTL support for Arabic interface

### Teacher Features
- Create surveys with drag-and-drop builder
- AI-powered question generation
- Manage survey lifecycle (draft → active → completed)
- View comprehensive survey analytics
- Export survey data (JSON format)
- Moderate student comments and feedback
- Duplicate existing surveys
- Target specific student demographics

### Admin Features
- Complete user management (students, teachers)
- Department management and administration
- System-wide survey oversight
- Global analytics and reporting
- Bulk operations for surveys and users
- Create surveys with admin privileges
- Manage all surveys across the platform

## File Naming Conventions
- Use kebab-case for file names and routes
- Use PascalCase for React component names
- Use camelCase for functions and variables
- Use descriptive names for translation keys
- Prefix admin components with 'admin-'
- Suffix participation components with '-participation'

## Component Organization
- Role-based component separation (student, teacher, admin)
- Feature-based grouping (auth, dashboard, surveys, profile)
- Reusable UI components in `/ui` directory
- Question type components for survey builder
- Shared layout components

## Authentication and Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Student, Teacher, Admin)
- Protected routes with middleware
- Automatic role-based redirects
- Google OAuth integration
- Secure cookie-based session management

## Mobile Responsiveness
- Mobile-first design approach
- Responsive breakpoints (sm, md, lg, xl)
- Touch-friendly interface elements
- Collapsible navigation for mobile
- Optimized survey participation on mobile
- Progressive Web App features

## API Integration
- Axios client with request/response interceptors
- Automatic token refresh handling
- Comprehensive error handling
- Type-safe API responses
- Service layer architecture
- RESTful API design patterns

## Additional Configuration Files
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration with RTL support
├── tsconfig.json            # TypeScript configuration
├── middleware.ts             # Next.js middleware for auth and routing
├── package.json             # Project dependencies
└── README.md                # Comprehensive project documentation
```