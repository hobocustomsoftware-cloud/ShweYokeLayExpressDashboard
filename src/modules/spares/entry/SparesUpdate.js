import {
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
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
import { sparePayload } from "../sparesPayload";
import { spareService } from "../sparesService";


export const SpareUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(sparePayload.update);
  const { spare } = useSelector((state) => state.spares);
  const params = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitCounter = async () => {
    setLoading(true);
    const formData = formBuilder(payload, sparePayload.update);
    const response = await spareService.update(dispatch, params.id, formData);
    if (response.status === 200) {
      navigate(paths.spares);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    await spareService.show(dispatch, params.id);
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (spare) {
      const updatePayload = { ...spare };
      setPayload(updatePayload);
    }
  }, [spare]);

  console.log(spare);
  
  return (
    <>
      <div className=" grid">
        <div className="col-12">
          <Breadcrumb />
        </div>

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.name ?? ""}
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
                  placeholder="Enter Name"
                />
                <ValidationMessage field="name" />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status (required)</InputLabel>
                <Select
                  id="status"
                  value={payload.status ?? ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "status",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
                <ValidationMessage field="status" />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <FormMainAction
                cancel="Cancel"
                cancelClick={() => navigate(paths.spares)}
                submit="Update"
                submitClick={submitCounter}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
    </>
  );
};
