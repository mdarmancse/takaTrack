# TakaTrack Deployment Guide

This guide covers deploying TakaTrack to production environments.

## 🚀 Production Deployment Options

### Option 1: DigitalOcean App Platform

1. **Prepare your repository:**
   - Ensure all code is committed to your Git repository
   - Create a production branch if needed

2. **Create App Platform App:**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the production branch

3. **Configure Services:**
   - **Backend Service:**
     - Source: `/backend`
     - Build Command: `composer install --no-dev --optimize-autoloader`
     - Run Command: `php artisan serve --host=0.0.0.0 --port=8080`
     - Environment Variables: See below

   - **Frontend Service:**
     - Source: `/frontend`
     - Build Command: `npm ci && npm run build`
     - Run Command: `npm run preview`
     - Environment Variables: See below

   - **Database:**
     - Add MySQL database service
     - Configure connection details

   - **Redis:**
     - Add Redis service for caching and queues

4. **Environment Variables:**
   ```bash
   # Backend
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-app.ondigitalocean.app
   DB_CONNECTION=mysql
   DB_HOST=your-db-host
   DB_DATABASE=your-db-name
   DB_USERNAME=your-db-user
   DB_PASSWORD=your-db-password
   REDIS_HOST=your-redis-host
   OPENAI_API_KEY=your-openai-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Frontend
   VITE_API_URL=https://your-backend.ondigitalocean.app/api
   VITE_APP_URL=https://your-frontend.ondigitalocean.app
   ```

### Option 2: AWS ECS with Fargate

1. **Create ECR Repositories:**
   ```bash
   aws ecr create-repository --repository-name takatrack-backend
   aws ecr create-repository --repository-name takatrack-frontend
   ```

2. **Build and Push Images:**
   ```bash
   # Backend
   docker build -t takatrack-backend ./backend
   docker tag takatrack-backend:latest your-account.dkr.ecr.region.amazonaws.com/takatrack-backend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/takatrack-backend:latest

   # Frontend
   docker build -t takatrack-frontend ./frontend
   docker tag takatrack-frontend:latest your-account.dkr.ecr.region.amazonaws.com/takatrack-frontend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/takatrack-frontend:latest
   ```

3. **Create ECS Task Definitions:**
   - Backend task definition with MySQL and Redis connections
   - Frontend task definition with backend API URL

4. **Create ECS Services:**
   - Configure load balancers
   - Set up auto-scaling
   - Configure health checks

### Option 3: Traditional VPS Deployment

1. **Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - PHP 8.3+ with extensions
   - Node.js 18+
   - MySQL 8.0+
   - Redis 6.0+
   - Nginx

2. **Install Dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install PHP 8.3
   sudo apt install software-properties-common
   sudo add-apt-repository ppa:ondrej/php
   sudo apt update
   sudo apt install php8.3-fpm php8.3-mysql php8.3-xml php8.3-mbstring php8.3-curl php8.3-zip php8.3-bcmath

   # Install Composer
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs

   # Install MySQL
   sudo apt install mysql-server

   # Install Redis
   sudo apt install redis-server

   # Install Nginx
   sudo apt install nginx
   ```

3. **Deploy Application:**
   ```bash
   # Clone repository
   git clone your-repo-url /var/www/takatrack
   cd /var/www/takatrack

   # Install backend dependencies
   cd backend
   composer install --no-dev --optimize-autoloader

   # Install frontend dependencies
   cd ../frontend
   npm ci
   npm run build

   # Set permissions
   sudo chown -R www-data:www-data /var/www/takatrack
   sudo chmod -R 755 /var/www/takatrack
   ```

4. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/takatrack/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## 🔧 Production Configuration

### Environment Variables

Create a `.env` file with production settings:

```bash
# Application
APP_NAME=TakaTrack
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=your-generated-key

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="TakaTrack"

# AI
OPENAI_API_KEY=your-openai-key
AI_ENABLED=true

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
ENCRYPTION_KEY=your-encryption-key
RATE_LIMIT_ENABLED=true
```

### Database Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE takatrack_production;
   CREATE USER 'takatrack'@'%' IDENTIFIED BY 'secure-password';
   GRANT ALL PRIVILEGES ON takatrack_production.* TO 'takatrack'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Run Migrations:**
   ```bash
   cd /var/www/takatrack/backend
   php artisan migrate --force
   php artisan db:seed --force
   ```

### SSL Configuration

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🔒 Security Checklist

- [ ] Change default database passwords
- [ ] Enable firewall (UFW)
- [ ] Configure fail2ban
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure session cookies
- [ ] Enable CSRF protection
- [ ] Configure proper file permissions
- [ ] Set up monitoring and logging

## 📊 Monitoring

### Application Monitoring

1. **Laravel Telescope (Development):**
   ```bash
   composer require laravel/telescope
   php artisan telescope:install
   ```

2. **Sentry (Production):**
   ```bash
   composer require sentry/sentry-laravel
   ```

3. **Health Checks:**
   - Database connectivity
   - Redis connectivity
   - External API availability
   - Disk space
   - Memory usage

### Log Management

1. **Configure Log Rotation:**
   ```bash
   sudo nano /etc/logrotate.d/takatrack
   ```

2. **Set up Centralized Logging:**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Fluentd
   - CloudWatch (AWS)

## 🚀 Performance Optimization

1. **Laravel Optimizations:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan optimize
   ```

2. **Frontend Optimizations:**
   ```bash
   npm run build
   # Enable gzip compression
   # Set up CDN for static assets
   ```

3. **Database Optimizations:**
   - Add proper indexes
   - Configure query caching
   - Set up read replicas if needed

## 🔄 Backup Strategy

1. **Database Backups:**
   ```bash
   # Daily backup script
   mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
   ```

2. **File Backups:**
   ```bash
   # Backup application files
   tar -czf takatrack_backup_$(date +%Y%m%d).tar.gz /var/www/takatrack
   ```

3. **Automated Backups:**
   - Set up cron jobs for regular backups
   - Store backups in secure, off-site location
   - Test backup restoration procedures

## 🚨 Troubleshooting

### Common Issues

1. **Permission Errors:**
   ```bash
   sudo chown -R www-data:www-data /var/www/takatrack
   sudo chmod -R 755 /var/www/takatrack
   ```

2. **Database Connection Issues:**
   - Check database credentials
   - Verify network connectivity
   - Check firewall settings

3. **Redis Connection Issues:**
   - Verify Redis is running
   - Check Redis configuration
   - Verify network connectivity

### Log Locations

- Laravel logs: `/var/www/takatrack/backend/storage/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables
3. Ensure all services are running
4. Check network connectivity
5. Review security configurations

## 🔄 Updates and Maintenance

1. **Regular Updates:**
   - Keep dependencies updated
   - Apply security patches
   - Monitor for vulnerabilities

2. **Maintenance Windows:**
   - Schedule regular maintenance
   - Plan for zero-downtime deployments
   - Test updates in staging first

3. **Monitoring:**
   - Set up alerts for critical issues
   - Monitor performance metrics
   - Track user experience metrics
