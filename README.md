# SurveyDU - University Survey Platform

A comprehensive full-stack survey platform for universities, built with Next.js 15 (App Router) and an ASP.NET Core backend. Features complete internationalization support with English and Arabic languages, including RTL (Right-to-Left) text direction.

## 🚀 Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Student, Teacher, and Admin roles with JWT-based security
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Profile Management**: Complete profile setup and editing for all user types
- **Password Management**: Secure password change and reset functionality

### 📊 Survey Management
- **Advanced Survey Creator**: Drag-and-drop interface with AI-powered question generation
- **Multiple Question Types**: Single Choice, Multiple Choice, Open Text, Rating Scale (1-5), Yes/No
- **Survey Lifecycle**: Draft → Active → Completed/Expired with full status management
- **Target Audience**: Filter by department, academic year, and gender
- **Points System**: Reward students with points for survey participation

### 🎯 Role-Based Dashboards
- **Student Dashboard**: Browse available surveys, track participation history, and manage points
- **Teacher Dashboard**: Create, manage, and analyze surveys with comprehensive statistics
- **Admin Dashboard**: System-wide management with user administration and department control

### 📈 Analytics & Statistics
- **Real-time Analytics**: Live survey response tracking and completion rates
- **Visual Statistics**: Charts and graphs for question responses and participation data
- **Export Capabilities**: JSON data export for detailed analysis
- **Comment System**: Student feedback collection and management

### 🌍 Internationalization (i18n)
- **Bilingual Support**: Complete English and Arabic language support
- **RTL Layout**: Proper right-to-left text direction for Arabic
- **Localized Content**: All UI elements, messages, and data translated
- **Dynamic Language Switching**: Real-time language switching without page reload

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes from mobile to desktop
- **Touch-Friendly**: Appropriate touch targets and spacing for mobile devices
- **Progressive Web App**: Fast loading and offline-capable features
- **Modern UI**: Beautiful interface with Tailwind CSS and shadcn/ui components

## 🏗️ Project Structure

```
SurveyDU-frontend/
├── app/                          # Next.js 15 App Router
│   ├── auth/                     # Authentication pages (signin, signup, forgot-password)
│   ├── dashboard/                # Role-based dashboard pages
│   │   ├── admin/                # Admin dashboard and management
│   │   ├── teacher/              # Teacher dashboard and survey tools
│   │   └── student/              # Student dashboard and participation
│   └── api/                      # API route handlers
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components for all roles
│   ├── question-types/           # Survey question type components
│   ├── surveys/                  # Survey creation and management
│   ├── profile/                  # User profile components
│   └── ui/                       # shadcn/ui and custom UI components
├── lib/                          # Library and utilities
│   ├── api/                      # Axios configuration and interceptors
│   ├── config/                   # Application configuration
│   ├── constants/                # Application constants and enums
│   ├── services/                 # API service layers
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
│   └── locales/                  # Translation files (en/ar)
│       ├── en/common.json        # English translations
│       └── ar/common.json        # Arabic translations
└── middleware.ts                 # Next.js middleware for auth and routing
```

## 🔧 Setup

### Prerequisites
- Node.js 18+ or Node.js 20+ (recommended)
- npm, pnpm, or yarn package manager
- ASP.NET Core backend API running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SurveyDU-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api-url.com/api
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🔌 API Integration

### Backend Services
- **Authentication Service**: JWT-based authentication with Google OAuth
- **Survey Service**: Complete CRUD operations for surveys and responses
- **User Service**: Profile management and user administration
- **Department Service**: University department management
- **Statistics Service**: Analytics and reporting endpoints

### API Features
- **Axios Interceptors**: Automatic token refresh and error handling
- **Request/Response Logging**: Comprehensive API interaction logging
- **Error Handling**: Graceful error handling with user-friendly messages
- **Type Safety**: Full TypeScript integration with API responses

## 🎓 Role-Specific Features

### 👨‍🎓 Student Features
- **Survey Participation**: Browse and complete available surveys
- **Points System**: Earn points for survey completion
- **Participation History**: Track completed surveys and earned points
- **Profile Management**: Update academic information and preferences
- **Mobile-Optimized**: Responsive design for mobile survey participation

### 👨‍🏫 Teacher Features
- **Survey Creation**: Advanced survey builder with AI assistance
- **Survey Management**: Complete lifecycle management (draft → active → completed)
- **Analytics Dashboard**: Detailed statistics and response analysis
- **Quick Edit**: Modify survey parameters without losing responses
- **Bulk Operations**: Publish, unpublish, and duplicate surveys

### 👨‍💼 Admin Features
- **User Management**: Create and manage teacher and student accounts
- **Department Management**: University department administration
- **System Analytics**: Platform-wide statistics and insights
- **Survey Oversight**: View and manage all surveys across the platform
- **Bulk Operations**: System-wide survey and user management

## 📊 Advanced Survey System

### Question Types
- **Single Choice**: Radio button selection with multiple options
- **Multiple Choice**: Checkbox selection allowing multiple answers
- **Open Text**: Free-form text input for detailed responses
- **Rating Scale**: 1-5 star rating system with descriptive labels
- **Yes/No**: Simple binary choice questions

### Survey Features
- **Drag & Drop Builder**: Intuitive question reordering and management
- **AI Question Generation**: Automatic question creation based on survey topic
- **Conditional Logic**: Advanced question flow and dependencies
- **Preview Mode**: Real-time survey preview during creation
- **JSON Export/Import**: Advanced survey data manipulation

### Participation Features
- **Progress Tracking**: Visual progress indicators during survey completion
- **Auto-Save**: Automatic response saving to prevent data loss
- **Responsive Design**: Optimized for all devices and screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support



## 🛠️ Technical Stack

### Frontend Technologies
- **Next.js 15**: Latest App Router with server-side rendering
- **React 19**: Latest React features with concurrent rendering
- **TypeScript**: Full type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: High-quality, accessible UI component library

### State Management & Data Fetching
- **React Context**: Global state management for user and locale data
- **Custom Hooks**: Reusable logic for authentication, translations, and API calls
- **Axios**: HTTP client with interceptors and error handling
- **React Hook Form**: Form validation and management

### Development Tools
- **ESLint & Prettier**: Code quality and consistent formatting
- **Husky**: Git hooks for code quality enforcement
- **TypeScript Strict Mode**: Enhanced type checking and safety
- **Hot Reload**: Fast development with instant updates

### UI/UX Features
- **Toast Notifications**: User feedback system with success/error states
- **Loading States**: Skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error handling and recovery
- **Responsive Design**: Mobile-first approach with breakpoint optimization

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```



### Deployment Platforms
- **Vercel**: Optimized for Next.js with automatic deployments
- **Netlify**: Static site hosting with serverless functions
- **Docker**: Containerized deployment for any cloud provider
- **AWS/Azure/GCP**: Cloud platform deployment with CDN integration

### Performance Optimizations
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic bundle splitting for faster loading
- **Static Generation**: Pre-rendered pages for better SEO
- **Caching**: Aggressive caching strategies for API responses

## 🌟 Key Achievements

- **Complete Internationalization**: Full English/Arabic support with RTL layout
- **Mobile-First Design**: Responsive across all devices and screen sizes
- **Advanced Survey Builder**: Drag-and-drop interface with AI assistance
- **Real-Time Analytics**: Live data visualization and statistics
- **Role-Based Security**: Comprehensive authentication and authorization
- **Performance Optimized**: Fast loading times and smooth user experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add translations for both English and Arabic
5. Test on both desktop and mobile devices
6. Ensure RTL layout works correctly for Arabic
7. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Issues**: Create an issue in the repository for bugs or feature requests
- **Documentation**: Comprehensive inline code documentation and comments
- **API Documentation**: Detailed API endpoint documentation
- **Translation Guide**: Guidelines for adding new languages
- **Deployment Guide**: Step-by-step deployment instructions

## 🎯 Future Enhancements

- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile App**: Native iOS and Android applications
- **Additional Languages**: Support for more languages beyond English/Arabic
- **Advanced Question Types**: File uploads, date pickers, and more
- **Integration APIs**: Third-party integrations and webhooks
- **White-label Solution**: Customizable branding for different institutions

---

**Built with ❤️ for Damascus University - Faculty of Electrical and Mechanical Engineering**

*A graduation project showcasing modern web development practices, internationalization, and user-centered design.*