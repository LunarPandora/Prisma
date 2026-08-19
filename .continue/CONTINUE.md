# CONTINUE.md
## Project Overview
**PRISMA LPPM** is a university Research Management System built with:
- **Backend**: Laravel 12 (PHP 8.2) for API endpoints and business logic
- **Frontend**: Next.js 13+ (React 18) for the research management dashboard
- **Database**: PostgreSQL (inferred from Prisma file patterns)
- **Server**: Laravel Sail for containerized development

Key features:
- Proposal submission and monitoring
- Research review process management
- User role-based access control (Admin, Dosen, Reviewer, Mahasiswa)
- Publication category management
- Funding tracking system

Architecture:
Next.js Frontend (prisma/src) <-> Laravel API (prisma-server) <-> PostgreSQL Database

## Getting Started
### Prerequisites
- Node.js 18.x
- PHP 8.2
- Composer
- Docker (for Laravel Sail)
- PostgreSQL 15+
- Yarn (recommended for frontend dependencies)

### Installation
1. Clone the repository
2. Navigate to prisma-server directory
3. Run `composer install` to install PHP dependencies
4. Navigate to prisma directory
5. Run `yarn install` to install frontend dependencies

### Environment Setup
```bash
# Configure .env files
 cd prisma-server
 cp .env.example .env
 php artisan key:generate

 cd prisma
 cp .env.example .env
 yarn dev
```

### Basic Usage
```bash
# Start Laravel development server
 cd prisma-server
 ./vendor/bin/sail up -d

# Start Next.js development server
 cd prisma
 yarn dev
```

### Running Tests
```bash
# Backend tests
 cd prisma-server
 ./vendor/bin/sail artisan test

# Frontend tests
 cd prisma
 yarn test
```

## Project Structure
```
├── prisma/                # Next.js frontend (React 18)
│   ├── src/               # Main frontend directory
│   │   ├── app/           # Next.js app directory (pages, components, layouts)
│   │   │   ├── dashboard/ # Main research management dashboard
│   │   │   ├── component/ # Reusable UI components
│   │   │   ├── stores/    # Zustand-like state management
│   │   │   └── pages/     # Page-specific components
│   │   ├── styles/        # Global CSS/SCSS files
│   │   └── app.js         # Next.js entry point
│   │
│   ├── .gitignore         # Frontend ignore file
│   └── package.json       # Frontend dependencies
│
├── prisma-server/         # Laravel 12 backend
│   ├── routes/            # API routing files
│   ├── vendor/            # Composer dependencies
│   ├── composer.json      # PHP dependencies
│   └── .env               # Environment configuration
│
├── .continue/             # Continue configuration
│   └── mcpServers/        # MCP server configurations
│       └── new-mcp-server.yaml
│
└── .git/                  # Git repository metadata
```

## Development Workflow
### Coding Standards
- Frontend: Prettier + ESLint (TypeScript config)
- Backend: PHPStan for type safety
- Consistent naming conventions across both codebases
- Next.js app directory structure for routing

### Testing
- Unit tests: PHPUnit for PHP, Jest for React
- Integration tests: Laravel's testing framework
- End-to-end tests: Cypress (if implemented)
- API testing: Postman or Laravel's API testing tools

### Build Process
- Frontend: Next.js build system (with App Router)
- Backend: Laravel Mix (from webpack.mix.js)
- Dockerized environment via Laravel Sail

### Contribution Guidelines
1. Run `yarn lint` and `composer run lint` before commits
2. Follow semantic commit conventions
3. Add tests for new features
4. Update documentation in CONTINUE.md
5. Use Git hooks for automated formatting

## Key Concepts
### Domain Model
- Research proposal lifecycle management
- Review process tracking with multi-stage approval
- Publication category management system
- Funding allocation tracking
- User role-based access control

### Core Abstractions
- `UserStore` for authentication state
- `LoaderStore` for UI state management
- `ReviewForm` component for evaluation workflows
- `MonitoringSystem` for proposal tracking
- `PublicationManager` for publication tracking

### Design Patterns
- Frontend: Next.js App Router with server components
- Backend: Laravel MVC pattern
- State management: Zustand for frontend state
- API design: RESTful endpoints with Laravel

## Common Tasks
### Setting Up Environment
```bash
# Configure .env file
 cd prisma-server
 cp .env.example .env
 php artisan key:generate
```

### Database Migrations
```bash
# Run migrations
 cd prisma-server
 ./vendor/bin/sail artisan migrate
```

### API Development
```bash
# Start API development server
 cd prisma-server
 ./vendor/bin/sail artisan serve
```

### Debugging
- Use Laravel Telescope for backend debugging
- Inspect React components with Chrome DevTools
- Use Next.js DevTools for frontend inspection
- Check Laravel logs in `prisma-server/storage/logs`

## Troubleshooting
### Common Issues
1. **Environment Configuration**: Check .env file settings
2. **Dependency Conflicts**: Run `composer update` and `yarn install`
3. **Database Connection**: Verify PostgreSQL service is running
4. **Port Conflicts**: Use `sail run` to run Laravel in Docker

### Debugging Tips
- Use `sail artisan tinker` for quick PHP testing
- Inspect Next.js server components with DevTools
- Check Next.js API route logs in the terminal
- Verify CORS settings for frontend-backend communication

## References
- [Laravel 12 Documentation](https://laravel.com/docs/12.x)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://prisma.io/docs)