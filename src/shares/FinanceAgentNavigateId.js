import { useDispatch, useSelector } from "react-redux";

import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { PermissionGate } from "../helpers/PermissionGate";
import { agentUpdate } from "../modules/finance/FinanceAgentSlice";
import { useNavigate } from "react-router-dom";

export const FinanceAgentNavigateId = ({
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

  const allAgents = useSelector((state) => state.financeAgent.agents);
  const handleEdit = () => {
    // get full list of users from redux
    const fullAgents = allAgents.find((u) => u.agent_id === id);

    // if not found, fallback to `data`
    const agent = fullAgents || data;

    dispatch(agentUpdate(agent));
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
