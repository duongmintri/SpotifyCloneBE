import React, { useState, useEffect } from "react";
import { FaUserShield, FaUser } from "react-icons/fa";
import { getUsers } from "../../../services/adminApi";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header-title">Quản lý người dùng</h1>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Danh sách người dùng</div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Premium</th>
              <th>Admin</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.full_name || "Không có"}</td>
                  <td>{user.is_premium ? "Có" : "Không"}</td>
                  <td>
                    {user.is_superuser ? (
                      <FaUserShield style={{ color: "#1DB954" }} title="Admin" />
                    ) : (
                      <FaUser title="Người dùng thường" />
                    )}
                  </td>
                  <td>{user.is_active ? "Hoạt động" : "Bị khóa"}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
