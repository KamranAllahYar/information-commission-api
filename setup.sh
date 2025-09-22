#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Optionally secure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgresql_password';"

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Configure Nginx to proxy requests to the Node.js app
sudo tee /etc/nginx/sites-available/social <<EOL
server {
    listen 80;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade "\$http_upgrade";
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass "\$http_upgrade";
    }
}
EOL

# Enable the Nginx configuration
sudo ln -s /etc/nginx/sites-available/social /etc/nginx/sites-enabled/

# Test and reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx

# Final message
echo "Setup is complete."
echo "The Node.js app is running on port 3010 and accessible via Nginx."
echo "PostgreSQL is installed. Use 'sudo -u postgres psql' to access it."
echo "If you installed pgAdmin, access it via your configured domain or http://localhost/pgadmin4."
