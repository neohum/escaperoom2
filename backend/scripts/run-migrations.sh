#!/bin/bash

# Load environment variables from backend/.env
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | grep -v '^$' | xargs)
elif [ -f ../../.env ]; then
    # Fallback to root .env
    export $(cat ../../.env | grep -v '^#' | grep -v '^$' | xargs)
fi

echo "Running database migrations..."

# Run all migration files in order
for migration in ../migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying $(basename $migration)..."
        mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "$migration"
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename $migration) applied successfully"
        else
            echo "❌ Failed to apply $(basename $migration)"
            exit 1
        fi
    fi
done

echo "✅ All migrations completed successfully!"
