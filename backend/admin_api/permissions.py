# admin_api/permissions.py
from rest_framework import permissions

class IsSuperUser(permissions.BasePermission):
    """
    Chỉ cho phép superuser truy cập
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
