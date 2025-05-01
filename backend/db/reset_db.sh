#!/bin/bash
set -a
source ../.env
set +a

echo "🔄 Resetting database using $SQL_FILE..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -f $SQL_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database reset thành công!"
else
    echo "❌ Lỗi reset database!"
fi
#cấp quyền chmod +x reset_db.sh
#chạy lệnh ./reset_db.sh