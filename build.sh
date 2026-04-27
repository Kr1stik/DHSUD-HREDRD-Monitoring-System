#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Install dependencies
pip install -r requirements.txt

# 2. Collect static files (needed for Django admin)
python manage.py collectstatic --no-input

# 3. Build the database tables automatically!
python manage.py migrate

# 4. Force-create a superuser if one doesn't exist
echo "Ensuring admin user exists..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"