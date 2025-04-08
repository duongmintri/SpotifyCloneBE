#!/bin/bash

DB_USER="postgres"
DB_PASS="123456"     # ← sửa lại đúng mật khẩu của bạn
SQL_FILE="spotify_clone.sql"

echo "🔄 Resetting database using $SQL_FILE..."

# Gọi psql với mật khẩu
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -f $SQL_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database reset thành công!"
else
    echo "❌ Lỗi reset database!"
fi
#cấp quyền chmod +x reset_db.sh
#chạy lệnh ./reset_db.sh