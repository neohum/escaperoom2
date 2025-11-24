#!/bin/bash

# Load environment variables from backend/.env
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | grep -v '^$' | xargs)
elif [ -f ../../.env ]; then
    # Fallback to root .env
    export $(cat ../../.env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Create database
echo "Creating database: $DB_NAME"
mysql -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully!"
    mysql -u $DB_USER -p$DB_PASSWORD -e "SHOW DATABASES;"
else
    echo "❌ Failed to create database. Please check your MySQL credentials in .env file"
    exit 1
fi
