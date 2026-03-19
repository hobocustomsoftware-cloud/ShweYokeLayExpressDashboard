import { useSelector } from "react-redux";

export const PermissionGate = ({ permission, roles, children }) => {
  const userRole = useSelector((state) => state.share.role);
  const userPermissions = useSelector((state) => state.share.permissions);

  // SUPER_ADMIN bypasses all
  if (userRole === "SUPER_ADMIN") return children;

  // Check role
  if (roles && !roles.includes(userRole)) return null;

  // Check permission
  if (!permission) return children; // if no permission required, allow
  if (userPermissions?.includes(permission)) return children;

  return null;
};
