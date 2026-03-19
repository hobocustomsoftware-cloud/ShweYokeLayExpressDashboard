import {
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
} from "@mui/material";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { formBuilder } from "../../../helpers/formBuilder";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { sparePayload } from "../sparesPayload";
import { spareService } from "../sparesService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const SpareCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(sparePayload.store);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitGenre = async () => {
    setLoading(true);
    const formData = formBuilder(payload, sparePayload.store);
    const create = await spareService.store(formData, dispatch);
    if (create.status == 200) {
      navigate(paths.spares);
    }
    setLoading(false);
  };

  return (
    <>
      <div className=" grid">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name (required)</InputLabel>
                <OutlinedInput
                  type="text"
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
              cancelClick={() => navigate(paths.spares)}
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
