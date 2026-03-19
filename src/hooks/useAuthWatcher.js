import { resetShareSlice, updateNotification } from "../shares/shareSlice"; // adjust import path
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// hooks/useAuthWatcher.js
import { useEffect } from "react";

export const useAuthWatcher = () => {
  const { role, permissions } = useSelector((state) => state.share);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // skip auth pages
    const publicPaths = ["/auth/login"];
    const isPublicPage = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    );
    if (isPublicPage) return;

    const noRole = !role || role.trim() === "";
    const noPermission = !permissions || permissions.length === 0;

    if (noRole || noPermission) {
      window.alert("Session expired! Please Login again.");

      dispatch(resetShareSlice());
      localStorage.clear();
      sessionStorage.clear();
      navigate("/auth/login", { replace: true });
    }
  }, [role, permissions, location.pathname, navigate, dispatch]);
};
