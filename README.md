# SurveyDU - University Survey Platform

A full-stack survey platform for universities, built with Next.js 14 (App Router) and an ASP.NET Core backend.

## 🚀 Features

- **Multi-role Authentication**: Student, Teacher, and Admin roles
- **Survey Management**: Teachers can create, edit, and manage surveys
- **Question Types**: Multiple question types (Single Line, Long Text, Radio Buttons, Checkboxes, Dropdown, Multi-Select, Rating Scale, Yes/No)
- **Teacher Dashboard**: View all your surveys, see points reward, participants, and analytics

- **Analytics**: Survey response analytics and insights
- **Modern UI**: Responsive design with Tailwind CSS and shadcn/ui
- **Real API Integration**: Connects to ASP.NET Core backend

## 🏗️ Project Structure

```
SurveyDU-master/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages for each role
│   ├── surveys/                  # Survey pages
│   └── ...
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── question-types/           # Question type components
│   ├── surveys/                  # Survey components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Library and utilities
│   ├── api/                      # API configuration
│   ├── config/                   # Configuration files
│   ├── constants/                # Application constants
│   ├── services/                 # API services
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
├── hooks/                        # Custom React hooks
└── public/                       # Static assets
```

## 🔧 Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- ASP.NET Core backend running at `***************************`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SurveyDU-master
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=********************************
   ```
4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔌 API Integration

- The project is configured to work with an ASP.NET Core backend at:
  `********************************`
- All authentication, survey, and comment features are integrated with real API endpoints.

## 🎓 Teacher Dashboard

- View all your created surveys in a sortable, filterable table
- See survey details: title, status, participants, teacher, created/expiry dates, **points reward**
- Access analytics and manage surveys
- Real-time data from the backend

## 📊 Survey System

- **Question Types**: Single Line, Long Text, Radio, Checkbox, Dropdown, Multi-Select, Rating Scale, Yes/No
- **Survey Creation**: Teachers can add, reorder, and configure questions
- **Survey Participation**: Students can view and complete available surveys
- **Analytics**: Teachers can view survey results and participation stats



## 🛠️ Development

- **TypeScript**: Full type safety
- **ESLint & Prettier**: Code quality and formatting
- **React Hooks & Context**: State management
- **Toast Notifications**: User feedback

## 🚀 Deployment

- Build for production:
  ```bash
  npm run build
  npm start
  ```
- Environment variable for production:
  ```env
  NEXT_PUBLIC_API_URL=https://your-production-api.com/api
  ```
- Deploy on Vercel, Netlify, or Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- Create an issue in the repository
- Contact the development team
- Check the documentation #