import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { payloadHandler } from "../../../helpers/handler";
import { paths } from "../../../constants/paths";
import { discountPayload } from "../discountPayload";
import { discountService } from "../discountService";

const CHANNELS = [
  { label: "KBZ Mini App", value: "miniapp" },
  { label: "Website", value: "website" },
  { label: "Android & iOS", value: "ios_android" },
];

export const DiscountCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(discountPayload.store);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleChannel = (channel) => {
    const current = Array.isArray(payload.channels) ? payload.channels : [];
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    payloadHandler(payload, next, "channels", setPayload);
  };

  const submit = async () => {
    setLoading(true);
    const submitPayload = { ...payload };
    if (submitPayload.valid_from === "") submitPayload.valid_from = null;
    if (submitPayload.valid_until === "") submitPayload.valid_until = null;
    const res = await discountService.store(submitPayload, dispatch);
    if (res.status === 200) {
      navigate(paths.discounts);
    }
    setLoading(false);
  };

  return (
    <div className="grid">
      <Paper elevation={3} style={{ padding: 24, margin: 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Name (required)</InputLabel>
              <OutlinedInput
                value={payload.name ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "name", setPayload)
                }
              />
              <ValidationMessage field={"name"} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Stack spacing={1}>
              <InputLabel>Type</InputLabel>
              <Select
                value={payload.type ?? "percentage"}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "type", setPayload)
                }
              >
                <MenuItem value="percentage">percentage</MenuItem>
                <MenuItem value="fixed">fixed (MMK)</MenuItem>
              </Select>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Stack spacing={1}>
              <InputLabel>Value</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.value ?? 0}
                onChange={(e) =>
                  payloadHandler(payload, Number(e.target.value), "value", setPayload)
                }
              />
              <ValidationMessage field={"value"} />
              {payload.type === "percentage" && (
                <Typography variant="caption" color="text.secondary">
                  Preview: {payload.value ?? 0}% of 50,000 MMK = {Math.round(50000 * Math.min(100, Math.max(0, Number(payload.value) || 0)) / 100).toLocaleString()} MMK
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Channels</InputLabel>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Only checked platforms will show this discount (Mini app, Website, iOS & Android). Unchecked = hidden on that platform.
              </Typography>
              <Grid container spacing={1}>
                {CHANNELS.map((c) => (
                  <Grid item key={c.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={(payload.channels ?? []).includes(c.value)}
                          onChange={() => toggleChannel(c.value)}
                        />
                      }
                      label={c.label}
                    />
                  </Grid>
                ))}
              </Grid>
              <ValidationMessage field={"channels"} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Valid from</InputLabel>
              <TextField
                type="datetime-local"
                value={payload.valid_from ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "valid_from", setPayload)
                }
                size="small"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Valid until</InputLabel>
              <TextField
                type="datetime-local"
                value={payload.valid_until ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "valid_until", setPayload)
                }
                size="small"
              />
            </Stack>
          </Grid>

          {[
            ["usage_limit", "Usage limit (total uses)"],
            ["per_user_limit", "Per user limit"],
            ["max_quantity_per_use", "Max quantity per use (seats)"],
            ["max_total_quantity", "Max total quantity (seats)"],
            ["min_order_amount", "Min order amount (MMK)"],
          ].map(([field, label]) => (
            <Grid item xs={12} md={4} key={field}>
              <Stack spacing={1}>
                <InputLabel>{label}</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload[field] ?? ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? null : Number(e.target.value),
                      field,
                      setPayload
                    )
                  }
                />
              </Stack>
            </Grid>
          ))}

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!payload.is_active}
                  onChange={(e) =>
                    payloadHandler(payload, e.target.checked, "is_active", setPayload)
                  }
                />
              }
              label="Active"
            />
          </Grid>

          <FormMainAction
            cancel="Cancel"
            cancelClick={() => navigate(paths.discounts)}
            submit="Create"
            submitClick={submit}
            loading={loading}
          />
        </Grid>
      </Paper>
    </div>
  );
};

