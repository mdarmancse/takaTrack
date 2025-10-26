# TakaTrack - Personal Finance Management System

## Overview
TakaTrack is a comprehensive personal finance management system built with Laravel 11 and React 18. It provides users with tools to track income, expenses, budgets, and financial goals with an intuitive, modern interface.

## Features

### Core Functionality
- **Transaction Management**: Track income and expenses with detailed categorization
- **Category Management**: Organize transactions with custom categories and budget limits
- **Account Management**: Manage multiple bank accounts, credit cards, and cash accounts
- **Budget Planning**: Set monthly and yearly budgets with progress tracking
- **Goal Setting**: Create and track financial goals (savings, debt payoff, etc.)
- **Dashboard Analytics**: Visual insights into spending patterns and financial health

### Technical Features
- **Modern Stack**: Laravel 11 + React 18 + TypeScript + TailwindCSS
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Updates**: Live data synchronization
- **Secure Authentication**: Laravel Sanctum with role-based access
- **API-First Architecture**: RESTful APIs for easy integration
- **Database Migrations**: Easy setup with Laravel migrations

## Installation

### Prerequisites
- PHP 8.3 or higher
- Node.js 18 or higher
- MySQL/PostgreSQL
- Composer
- NPM/Yarn

### Backend Setup
1. Clone the repository
2. Install PHP dependencies:
   ```bash
   cd backend
   composer install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Configure database in `.env` file
6. Run migrations:
   ```bash
   php artisan migrate
   ```
7. Seed initial data:
   ```bash
   php artisan db:seed
   ```
8. Start the server:
   ```bash
   php artisan serve
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Production Deployment
1. Build frontend for production:
   ```bash
   npm run build
   ```
2. Configure web server (Apache/Nginx) to serve Laravel backend
3. Set up SSL certificate
4. Configure environment variables for production

## Configuration

### Environment Variables
Key environment variables to configure:

```env
APP_NAME=TakaTrack
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=takatrack
DB_USERNAME=your-username
DB_PASSWORD=your-password

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Database Configuration
The application uses Laravel migrations for database setup. Key tables include:
- `users` - User accounts and authentication
- `transactions` - Financial transactions
- `categories` - Transaction categories
- `accounts` - Financial accounts
- `budgets` - Budget planning
- `goals` - Financial goals

## Usage

### Getting Started
1. Register a new account or use the default admin credentials
2. Set up your financial accounts (bank accounts, credit cards, etc.)
3. Create categories for your income and expenses
4. Start adding transactions
5. Set up budgets and financial goals

### Key Features Guide

#### Transaction Management
- Add income and expense transactions
- Categorize transactions for better organization
- Set recurring transactions for regular payments
- View transaction history with filtering options

#### Budget Planning
- Create monthly and yearly budgets
- Set budget limits for different categories
- Track budget progress with visual indicators
- Receive notifications when approaching limits

#### Goal Setting
- Set savings goals with target amounts and dates
- Track debt payoff goals
- Monitor progress with visual progress bars
- Celebrate achievements with gamification features

## Customization

### Styling
The application uses TailwindCSS for styling. Key customization points:
- Color scheme in `frontend/src/index.css`
- Component styles in individual React components
- Responsive breakpoints and layouts

### Features
- Add new transaction types
- Customize category icons and colors
- Modify budget calculation methods
- Extend goal types and tracking

## API Documentation

### Authentication
All API endpoints require authentication via Laravel Sanctum tokens.

### Key Endpoints
- `POST /api/auth/login` - User login
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account

## Support

### Common Issues
1. **Database Connection**: Ensure database credentials are correct
2. **CORS Issues**: Configure SANCTUM_STATEFUL_DOMAINS properly
3. **File Permissions**: Ensure Laravel has write permissions for storage
4. **Node Modules**: Clear cache and reinstall if build fails

### Getting Help
- Check Laravel documentation for backend issues
- Review React documentation for frontend issues
- Check browser console for JavaScript errors
- Review server logs for PHP errors

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- Core transaction management
- Category and account management
- Budget planning
- Goal setting
- Dashboard analytics
- User authentication
- Responsive design
