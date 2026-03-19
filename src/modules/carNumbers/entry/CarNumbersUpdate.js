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
import { carNumberPayload } from "../carNumbersPayload";
import { carNumbersService } from "../carNumbersService";


export const CarNumbersUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(carNumberPayload.update);
  const { carNumber } = useSelector((state) => state.carNumbers);
  const params = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitCounter = async () => {
    setLoading(true);
    const formData = formBuilder(payload, carNumberPayload.update);
    const response = await carNumbersService.update(dispatch, params.id, formData);
    if (response.status === 200) {
      navigate(paths.carNumbers);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    await carNumbersService.show(dispatch, params.id);
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (carNumber) {
      const updatePayload = { ...carNumber };
      setPayload(updatePayload);
    }
  }, [carNumber]);

  console.log(carNumber);
  
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
                  placeholder="Enter Car Number"
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
                cancelClick={() => navigate(paths.carNumbers)}
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
