# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo
python3 -m venv venv

# Kích hoạt môi trường ảo
source venv/bin/activate

# Đảm bảo bạn đang ở trong thư mục backend và đã kích hoạt venv
pip install -r requirements.txt

# Kiểm tra PostgreSQL đã chạy chưa
sudo systemctl status postgresql

# Nếu chưa chạy thì khởi động
sudo systemctl start postgresql

# Tạo database mới
psql -U postgres -c "CREATE DATABASE spotify_clone;"

**#tạo file .env cùng cấp với settings.py**
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=spotify_clone
DB_USER=postgres
DB_PASS=123456
DB_HOST=localhost
DB_PORT=5432

**#Chạy tiếp lệnh sau:**
python manage.py makemigrations music
python manage.py makemigrations accounts
python manage.py migrate
python manage.py seed_data

# Khởi động server Django
python manage.py runserver