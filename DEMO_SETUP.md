# TakaTrack Demo Setup Guide

## Demo Environment Requirements

### Server Requirements
- PHP 8.3+
- MySQL 8.0+
- Node.js 18+
- SSL Certificate (for production demo)
- Domain name

### Demo Configuration

#### 1. Database Setup
```sql
-- Create demo database
CREATE DATABASE takatrack_demo;

-- Import sample data
-- Include sample transactions, categories, accounts, budgets, and goals
```

#### 2. Sample Data
Create demo accounts with:
- **Admin Account**: admin@demo.com / password
- **User Account**: user@demo.com / password
- **Sample Transactions**: Various income and expense transactions
- **Sample Categories**: Food, Rent, Entertainment, Salary, Freelance, etc.
- **Sample Accounts**: Checking, Savings, Credit Card, Cash
- **Sample Budgets**: Monthly budgets for different categories
- **Sample Goals**: Emergency fund, Vacation savings, etc.

#### 3. Environment Configuration
```env
APP_NAME="TakaTrack Demo"
APP_ENV=demo
APP_DEBUG=false
APP_URL=https://demo.takatrack.com

DB_DATABASE=takatrack_demo
DB_USERNAME=demo_user
DB_PASSWORD=demo_password

# Demo-specific settings
DEMO_MODE=true
DEMO_DATA_RESET_HOURS=24
```

#### 4. Demo Features to Highlight
- **Dashboard**: Show financial overview with charts
- **Transaction Management**: Add/edit/delete transactions
- **Category Management**: Create custom categories
- **Budget Tracking**: Set and monitor budgets
- **Goal Setting**: Create and track financial goals
- **Account Management**: Manage multiple accounts
- **Responsive Design**: Show mobile/tablet views
- **Real-time Updates**: Demonstrate live data sync

#### 5. Demo Script
1. **Login** - Show authentication
2. **Dashboard** - Overview of financial health
3. **Add Transaction** - Demonstrate transaction creation
4. **Category Management** - Show categorization features
5. **Budget Planning** - Set up monthly budget
6. **Goal Setting** - Create savings goal
7. **Account Management** - Add new account
8. **Mobile View** - Show responsive design
9. **Analytics** - Demonstrate reporting features

#### 6. Demo Limitations
- Data resets every 24 hours
- Limited to demo accounts only
- No real financial data
- Read-only mode for some features

## Demo Deployment Steps

### 1. Server Setup
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm install --production

# Build frontend
npm run build

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### 2. Database Migration
```bash
php artisan migrate --force
php artisan db:seed --class=DemoSeeder
```

### 3. Cache Optimization
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Web Server Configuration
Configure Nginx/Apache to serve the Laravel application and static assets.

## Demo Monitoring
- Set up error tracking (Sentry)
- Monitor performance metrics
- Track user interactions
- Regular data backups
- Automated data reset scripts
