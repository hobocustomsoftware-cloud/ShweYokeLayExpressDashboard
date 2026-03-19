import {
  Box,
  Grid,
  InputLabel,
  OutlinedInput,
  Paper,
  Stack,
  Switch,
  styled,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { formBuilder } from "../../../helpers/formBuilder";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { rolePayload } from "../rolePayload";
import { roleService } from "../roleService";

export const RoleUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(rolePayload.update);

  const [permission, setPermission] = useState([]);
  const [roles, setRoles] = useState([]);

  const { role } = useSelector((state) => state.role);
  const params = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const Item = styled(Paper)(() => ({
    textAlign: "center",
    height: 60,
    width: 260,
    lineHeight: "60px",
  }));

  const permissionHandle = async (e, id) => {
    setRoles((roles) =>
      e.target.checked
        ? [...roles, id]
        : roles.filter((roleId) => roleId !== id)
    );
  };

  const submitRole = async () => {
    setLoading(true);
    // const formData = formBuilder(payload, rolePayload.update);
    const response = await roleService.update(dispatch, params.id, payload);
    if (response.status === 200) {
      navigate(paths.role);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    const result = await roleService.show(dispatch, params.id);
    if (result.status === 200) {
      setRoles(result.data.permissions?.map((item) => item.id));
    }
    const permissionResult = await roleService.permission(dispatch);
    if (permissionResult.status === 200) {
      setPermission(permissionResult.data);
    }
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    payloadHandler(payload, roles, "permissions", (updateValue) => {
      setPayload(updateValue);
    });
  }, [roles]);

  useEffect(() => {
    if (role) {
      const updatePayload = { ...role };
      setPayload(updatePayload);
    }
  }, [role]);

  return (
    <>
      <div className=" grid">
        <div className="mb-5">
          <Breadcrumb />
        </div>

        <Paper elevation={3} style={{ padding: 20 }}>
          <Grid container spacing={3} sx={{ marginBottom: 5 }}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Name (unchangeable) </InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.name ? payload.name : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "name",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="name"
                  placeholder="Enter Role Name"
                  readOnly
                />
                <ValidationMessage field={"name"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Description </InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.description ? payload.description : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "description",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="description"
                  placeholder="Enter Role Address"
                />
                <ValidationMessage field={"description"} />
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ marginBottom: 5 }}>
            <Grid item xs={4}>
              <Item
                elevation={2}
                sx={{
                  paddingLeft: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                All
                <Switch
                  onChange={(e) => {
                    setRoles(
                      e.target.checked ? permission?.map((item) => item.id) : []
                    );
                  }}
                  checked={roles.length == permission.length}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Item>
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: "background.default",
                  display: "grid",
                  gridTemplateColumns: {
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                    lg: "1fr 1fr 1fr 1fr",
                    xl: "1fr 1fr 1fr 1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                {permission?.map((p) => (
                  <Item
                    key={p.id}
                    elevation={2}
                    sx={{
                      paddingLeft: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {p.name}
                    <Switch
                      onChange={(e) => {
                        permissionHandle(e, p.id);
                      }}
                      checked={roles?.some((r) => r === p.id)}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  </Item>
                ))}
              </Box>
            </Grid>
          </Grid>

          <FormMainAction
            cancel="Cancle"
            cancelClick={() => navigate(paths.role)}
            submit="Update"
            submitClick={submitRole}
            loading={loading}
          />
        </Paper>
      </div>
    </>
  );
};
