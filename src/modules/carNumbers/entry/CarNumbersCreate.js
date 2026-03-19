import {
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { paths } from "../../../constants/paths";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { payloadHandler } from "../../../helpers/handler";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { formBuilder } from "../../../helpers/formBuilder";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { carNumberPayload } from "../carNumbersPayload";
import { carNumbersService } from "../carNumbersService";

export const CarNumbersCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(carNumberPayload.store);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitGenre = async () => {
    setLoading(true);
    const formData = formBuilder(payload, carNumberPayload.store);
    const create = await carNumbersService.store(formData, dispatch);
    if (create.status == 200) {
      navigate(paths.carNumbers);
    }
    setLoading(false);
  };

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
                  value={payload?.name || ""}
                  onChange={(e) => {
                    payloadHandler(
                      payload,
                      e.target.value,
                      "name",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    );
                  }}
                  name="name"
                  placeholder="Enter Car Number (e.g. 1B:123456)"
                />
                <ValidationMessage field={"name"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status (required)</InputLabel>
                <Select
                  id="status"
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
                <ValidationMessage field={"status"} />
              </Stack>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.carNumbers)}
              submit="Create"
              submitClick={submitGenre}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
