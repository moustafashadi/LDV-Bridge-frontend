# LDV-Bridge Platform

A comprehensive governance and version control system for low-code/no-code (LCNC) applications. The platform serves three primary personas with distinct interfaces optimized for their workflows.

## Platform Overview

### Three Main Portals

1. **Citizen Developer Portal** - Simplified, visual-first interface for non-technical users
2. **Professional Developer Dashboard** - Technical workspace for reviewing and managing changes
3. **Admin & Governance Console** - Policy management, compliance, and platform oversight

## Features

### Citizen Developer Portal
- **Dashboard**: View active apps, recent activity, and quick actions
- **Sandbox Workspace**: Safe, isolated environment for testing changes
- **Review Status**: Track approval pipeline and communicate with reviewers
- **Learning Hub**: Self-service education with tutorials and best practices

### Professional Developer Dashboard
- **Review Queue**: Prioritized list of pending reviews with risk assessment
- **Visual Diff Viewer**: Side-by-side comparison with code and security analysis
- **Change History**: Complete audit trail with rollback capabilities
- **CI/CD Pipelines**: Monitor automated build, test, and deployment pipelines

### Admin & Governance Console
- **Analytics Dashboard**: KPIs, charts, and performance metrics
- **Policy Configuration**: Define governance rules and approval workflows
- **Platform Connectors**: Manage integrations with LCNC platforms and DevOps tools
- **User Management**: Assign roles, permissions, and app access
- **Compliance Reports**: Generate SOX, GDPR, and custom compliance reports

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Custom Toast System

## Getting Started

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

### Project Structure

\`\`\`
app/
├── page.tsx                          # Role selection homepage
├── citizen-developer/                # Citizen Developer Portal
│   ├── page.tsx                      # Dashboard
│   ├── sandbox/[id]/page.tsx         # Sandbox workspace
│   ├── review/[id]/page.tsx          # Review status
│   ├── changes/page.tsx              # My changes
│   ├── learning/page.tsx             # Learning hub
│   └── review/page.tsx               # Request review
├── pro-developer/                    # Professional Developer Dashboard
│   ├── page.tsx                      # Review queue
│   ├── review/[id]/page.tsx          # Visual diff viewer
│   ├── history/page.tsx              # Change history
│   ├── pipelines/page.tsx            # CI/CD pipelines
│   └── audit/page.tsx                # Audit logs
└── admin/                            # Admin & Governance Console
    ├── page.tsx                      # Analytics dashboard
    ├── policies/page.tsx             # Policy configuration
    ├── connectors/page.tsx           # Platform connectors
    ├── users/page.tsx                # User management
    └── compliance/page.tsx           # Compliance reports

components/
├── layout/                           # Shared layout components
│   ├── main-nav.tsx                  # Global navigation
│   ├── page-header.tsx               # Page header
│   ├── status-badge.tsx              # Status indicators
│   ├── risk-indicator.tsx            # Risk level display
│   └── demo-toast-button.tsx         # Toast demo
└── notifications/                    # Notification system
    ├── toast-provider.tsx            # Toast context provider
    └── toast.tsx                     # Toast component
\`\`\`

## Key Features

### Navigation System
- Persistent top navigation with role-based menu items
- Global search functionality
- Notification center with badge count
- User profile dropdown

### Status & Risk Indicators
- Visual status badges (live, pending, rejected, draft, approved, failed)
- Risk level indicators (low, medium, high)
- Color-coded for quick identification

### Toast Notifications
- Success, error, info, and warning types
- Auto-dismiss with customizable duration
- Positioned in bottom-right corner
- Smooth animations

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Stacked layouts on smaller screens
- Touch-friendly button sizes

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Main actions and highlights
- **Success**: Green (#10b981) - Approved, passed states
- **Warning**: Yellow (#f59e0b) - Pending, caution states
- **Error**: Red (#ef4444) - Rejected, failed states
- **Neutral**: Slate (#1e293b - #94a3b8) - Backgrounds and text

### Typography
- **Font**: Geist (sans-serif) for all text
- **Mono**: Geist Mono for code and technical content
- **Line Height**: 1.5 for body text

## Deployment

The application is ready to deploy to Vercel:

\`\`\`bash
# Deploy to Vercel
vercel deploy
\`\`\`

## Future Enhancements

- Real-time collaboration features
- Advanced filtering and search
- Custom dashboard widgets
- API integrations with LCNC platforms
- Webhook support for external systems
- Advanced analytics and reporting
- Multi-language support

## License

MIT
