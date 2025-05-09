# Cài đặt PM2
npm install -g pm2

# Chạy backend với PM2
cd backend
source venv/bin/activate
pm2 start daphne --name spotify-backend -- spotify_clone.asgi:application -b 0.0.0.0 -p 8000

# Chạy frontend với PM2
cd frontend
pm2 start npm --name spotify-frontend -- run dev -- --host 0.0.0.0

# Thiết lập tự động khởi động khi máy chủ khởi động lại
pm2 startup
pm2 save