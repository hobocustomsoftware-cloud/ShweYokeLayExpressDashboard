import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch } from "react-redux";
import { alertToggle, setSelectedId } from "./shareSlice";
import { PermissionGate } from "../helpers/PermissionGate";

export const NavigateId = ({ url, id, editPermission, deletePermission }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(setSelectedId(id));
    dispatch(alertToggle());
  };

  return (
    <>
      <PermissionGate permission={editPermission}>
        <IconButton
          sx={{ cursor: "pointer", mr: 1 }}
          onClick={() => navigate(url)}
        >
          <EditIcon style={{ color: "#1876D2" }} />
        </IconButton>
      </PermissionGate>

      <PermissionGate permission={deletePermission}>
        <IconButton sx={{ cursor: "pointer" }} onClick={handleDelete}>
          <DeleteIcon style={{ color: "red" }} />
        </IconButton>
      </PermissionGate>
    </>
  );
};
