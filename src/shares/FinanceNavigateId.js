import { alertToggle, setSelectedId } from "./shareSlice";
import { useDispatch, useSelector } from "react-redux";

// import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { PermissionGate } from "../helpers/PermissionGate";
import { update } from "../modules/finance/FinanceUserSlice";
// import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const FinanceNavigateId = ({
  editUrl,
  detailUrl,
  id,
  data,
  editPermission,
  deletePermission,
  detailPermission,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allUsers = useSelector((state) => state.financeUser.users);
  const handleEdit = () => {
    // get full list of users from redux
    const fullUser = allUsers.find((u) => u.user_id === id);

    // if not found, fallback to `data`
    const userToStore = fullUser || data;

    dispatch(update(userToStore));
    navigate(editUrl);
  };

  return (
    <div className="flex gap-1 items-center">
      <PermissionGate permission={detailPermission}>
        <IconButton
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(detailUrl)}
        >
          <InfoIcon style={{ color: "#59acffff" }} />
        </IconButton>
      </PermissionGate>
      <PermissionGate permission={editPermission}>
        <IconButton sx={{ cursor: "pointer" }} onClick={handleEdit}>
          <EditIcon style={{ color: "#1876D2" }} />
        </IconButton>
      </PermissionGate>
      {/* <PermissionGate permission={deletePermission}>
        <IconButton sx={{ cursor: "pointer" }} onClick={handleDelete}>
          <DeleteIcon style={{ color: "red" }} />
        </IconButton>
      </PermissionGate> */}
    </div>
  );
};
