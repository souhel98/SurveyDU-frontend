# SurveyDU Project Structure

## App Directory Structure
```
app/
├── api/                          # API routes
│   ├── auth/                     # Authentication endpoints
│   ├── surveys/                  # Survey-related endpoints
│   └── users/                    # User management endpoints
├── auth/                         # Authentication pages
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── dashboard/                    # Dashboard routes by role
│   ├── student/                  # Student dashboard
│   │   ├── page.tsx             # Main student dashboard
│   │   ├── profile/             # Student profile
│   │   ├── surveys/             # Student's surveys
│   │   └── points/              # Points history
│   ├── teacher/                  # Teacher dashboard
│   │   ├── page.tsx             # Main teacher dashboard
│   │   ├── profile/             # Teacher profile
│   │   ├── surveys/             # Survey management
│   │   └── analytics/           # Survey analytics
│   └── admin/                    # Admin dashboard
│       ├── page.tsx             # Main admin dashboard
│       ├── users/               # User management
│       ├── departments/         # Department management
│       └── settings/           # System settings
├── surveys/                      # Survey routes
│   ├── [id]/                    # Individual survey routes
│   │   ├── page.tsx             # Survey participation
│   │   ├── edit/                # Edit survey
│   │   └── analytics/           # Survey analytics
│   └── create/                  # Create new survey
├── role-selection/              # Role selection page
├── layout.tsx                   # Root layout
├── page.tsx                     # Landing page
└── globals.css                  # Global styles

## Components Directory Structure
components/
├── auth/                        # Authentication components
├── dashboard/                   # Dashboard components
│   ├── student/
│   ├── teacher/
│   └── admin/
├── surveys/                     # Survey-related components
│   ├── creation/
│   ├── participation/
│   └── analytics/
├── shared/                      # Shared components
└── ui/                         # UI components (shadcn/ui)

## Lib Directory Structure
lib/
├── api/                        # API client functions
├── auth/                       # Authentication utilities
├── db/                        # Database utilities
├── types/                     # TypeScript types
└── utils/                     # Utility functions

## Public Directory Structure
public/
├── images/                    # Static images
└── icons/                     # Icons

## Styles Directory Structure
styles/
└── globals.css               # Global styles

## Additional Configuration Files
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Key Features by Role

### Student Features
- View available surveys
- Participate in surveys
- Track points
- View participation history
- Update profile

### Teacher Features
- Create surveys
- Manage surveys
- View analytics
- Export results
- Manage student responses

### Admin Features
- User management
- Department management
- System settings
- Global analytics
- Role management

## File Naming Conventions
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for functions and variables
- Add type suffix for type definitions (e.g., `types.ts`)
- Add context suffix for React contexts (e.g., `survey-context.tsx`)

## Component Organization
- Each component should have its own directory if it has associated files
- Include index.ts files for cleaner imports
- Co-locate related components
- Keep components focused and single-responsibility

## API Routes Organization
- Group by feature/resource
- Use HTTP methods appropriately
- Include proper error handling
- Implement middleware where needed

## Authentication and Authorization
- Protected routes in app/dashboard
- Role-based access control
- Middleware for auth checks
- Secure API routes 