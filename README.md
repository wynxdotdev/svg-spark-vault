# SVG Spark Vault

A beautiful, modern SVG management toolkit inspired by Heroicons. Organize, search, and manage your SVG icon collections with ease.

## 🚀 Features

### Core Functionality
- **📁 Project Management**: Organize SVGs into custom projects with color coding
- **🔍 Advanced Search**: Filter by name, tags, projects with grid/list views
- **📤 Smart Upload**: Drag & drop SVG upload with auto-optimization
- **📊 Analytics Dashboard**: Track views, downloads, and usage statistics
- **👤 User Profiles**: Personal dashboard with achievements and activity tracking
- **⚙️ Comprehensive Settings**: Theme switching, notifications, privacy controls

### Design System
- **🎨 Vibrant Theme**: Purple gradient design with smooth animations
- **🌓 Dark/Light Mode**: Seamless theme switching with system preference detection
- **📱 Responsive Design**: Mobile-first approach with beautiful layouts
- **✨ Smooth Animations**: Hover effects, transitions, and micro-interactions

### Project Features
- **Auto-categorization**: Unassigned SVGs go to "Random" project
- **Smart Filtering**: Filter by date, name (A-Z), custom tags
- **Batch Operations**: Download all, move between projects
- **Usage Analytics**: Track individual SVG performance

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── main-layout.tsx          # Main app layout with sidebar
│   ├── navigation/
│   │   └── sidebar-nav.tsx          # Collapsible navigation sidebar
│   ├── ui/                          # Shadcn UI components (enhanced)
│   ├── theme-provider.tsx           # Theme context and management
│   └── theme-toggle.tsx             # Theme switcher component
├── pages/
│   ├── Dashboard.tsx                # Main dashboard with stats
│   ├── Search.tsx                   # Advanced SVG search interface
│   ├── Upload.tsx                   # SVG upload with project selection
│   ├── Analytics.tsx                # Performance analytics
│   ├── Profile.tsx                  # User profile and achievements
│   ├── Settings.tsx                 # App settings and preferences
│   └── ProjectView.tsx              # Individual project management
├── hooks/
│   └── use-toast.ts                 # Toast notifications
└── lib/
    └── utils.ts                     # Utility functions
```

## 🎨 Design System

The app uses a comprehensive design system with:
- **CSS Variables**: Semantic color tokens in `src/index.css`
- **Tailwind Extensions**: Custom gradients, shadows, and animations
- **Component Variants**: Enhanced shadcn components with theme-aware styling

### Color Palette
- **Primary**: Vibrant purple (`hsl(258 90% 66%)`)
- **Accent**: Complementary magenta (`hsl(280 85% 60%)`)
- **Gradients**: Multi-stop gradients for hero sections and CTAs
- **Semantic Colors**: Success, warning, destructive with proper contrast

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with ES6+ support

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd svg-spark-vault

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Dashboard**: Overview of your SVG collection with recent uploads and project stats
2. **Upload**: Drag & drop SVGs, assign to projects, add tags
3. **Search**: Find SVGs across all projects with advanced filtering
4. **Projects**: Manage individual collections with custom organization
5. **Analytics**: Track performance metrics and usage patterns
6. **Settings**: Customize appearance, notifications, and privacy

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn UI (enhanced with custom variants)
- **Routing**: React Router DOM
- **State Management**: React Query for server state
- **Build Tool**: Vite
- **Theme**: Next-themes for dark/light mode

## 📊 Features Overview

### Dashboard
- Project statistics and recent activity
- Quick upload and project creation
- Visual project grid with usage metrics

### Search & Discovery
- Real-time search across all SVGs
- Filter by project, tags, upload date
- Grid/list view with hover actions
- Copy, download, and favorite functionality

### Project Management
- Color-coded project organization
- Custom tags and descriptions
- Public/private project settings
- Bulk operations and project analytics

### User Experience
- Achievements and milestones system
- Activity timeline and usage history
- Customizable notification preferences
- Comprehensive privacy controls

## 🔧 Customization

The design system is fully customizable through:
- CSS variables in `src/index.css`
- Tailwind configuration in `tailwind.config.ts`
- Component variants in `src/components/ui/`

## 📝 License

This project is built with Lovable and follows modern web development best practices.

## 🚀 Deployment

Deploy easily using Lovable's built-in deployment:
1. Click **Share > Publish** in the Lovable editor
2. Your app will be live instantly with a custom domain option

For custom deployment:
- Build with `npm run build`
- Deploy the `dist` folder to any static hosting service
