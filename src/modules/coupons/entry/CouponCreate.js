import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  OutlinedInput,
  Paper,
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
import { couponPayload } from "../couponPayload";
import { couponService } from "../couponService";

const CHANNELS = [
  { label: "KBZ Mini App", value: "miniapp" },
  { label: "Website", value: "website" },
  { label: "Android & iOS", value: "ios_android" },
];

export const CouponCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(couponPayload.store);
  const [bulkCount, setBulkCount] = useState(20);
  const [generatedCodes, setGeneratedCodes] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleChannel = (channel) => {
    const current = Array.isArray(payload.channels) ? payload.channels : [];
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    payloadHandler(payload, next, "channels", setPayload);
  };

  const suggestCode = async () => {
    const res = await couponService.generateCode(dispatch);
    if (res.status === 200) {
      payloadHandler(payload, res.data.code, "code", setPayload);
    }
  };

  const bulkGenerate = async () => {
    // Seat limits remain manual in the form; bulk-generate uses current form settings.
    setLoading(true);
    const submitPayload = { ...payload };
    submitPayload.type = "percentage";
    if (submitPayload.valid_from === "") submitPayload.valid_from = null;
    if (submitPayload.valid_until === "") submitPayload.valid_until = null;

    const res = await couponService.bulkGenerate(dispatch, {
      count: bulkCount,
      type: submitPayload.type,
      value: submitPayload.value ?? 0,
      channels: submitPayload.channels ?? [],
      valid_from: submitPayload.valid_from,
      valid_until: submitPayload.valid_until,
      per_user_limit: submitPayload.per_user_limit ?? 1,
      max_quantity_per_use: submitPayload.max_quantity_per_use ?? null,
      max_total_quantity: submitPayload.max_total_quantity ?? null,
      min_order_amount: submitPayload.min_order_amount ?? null,
      is_active: !!submitPayload.is_active,
    });

    if (res.status === 200) {
      const codes = res.data?.codes ?? [];
      setGeneratedCodes(codes.join("\n"));
    }
    setLoading(false);
  };

  const submit = async () => {
    setLoading(true);
    const submitPayload = { ...payload };
    // Coupon type not selectable: default percentage
    submitPayload.type = "percentage";
    if (submitPayload.valid_from === "") submitPayload.valid_from = null;
    if (submitPayload.valid_until === "") submitPayload.valid_until = null;
    const res = await couponService.store(submitPayload, dispatch);
    if (res.status === 200) {
      navigate(paths.coupons);
    }
    setLoading(false);
  };

  return (
    <div className="grid">
      <Paper elevation={3} style={{ padding: 24, margin: 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Coupon Code (optional)</InputLabel>
              <OutlinedInput
                value={payload.code ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "code", setPayload)
                }
                placeholder="Leave empty to auto-generate"
              />
              <ValidationMessage field={"code"} />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={suggestCode} disabled={loading}>
                  Suggest code
                </Button>
                <OutlinedInput
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value) || 1)}
                  placeholder="Count"
                  size="small"
                  sx={{ width: 120 }}
                />
                <Button size="small" variant="contained" onClick={bulkGenerate} disabled={loading}>
                  Bulk generate
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Discount %</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.value ?? 0}
                onChange={(e) =>
                  payloadHandler(payload, Number(e.target.value), "value", setPayload)
                }
              />
              <ValidationMessage field={"value"} />
              <Typography variant="caption" color="text.secondary">
                Preview: {payload.value ?? 0}% of 50,000 MMK = {Math.round(50000 * Math.min(100, Math.max(0, Number(payload.value) || 0)) / 100).toLocaleString()} MMK
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={1}>
              <InputLabel>Channels</InputLabel>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Only checked platforms will show this coupon (Mini app, Website, iOS & Android). Unchecked = hidden on that platform.
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

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Valid from</InputLabel>
              <TextField
                type="datetime-local"
                value={payload.valid_from ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "valid_from", setPayload)
                }
                size="small"
                fullWidth
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Valid until</InputLabel>
              <TextField
                type="datetime-local"
                value={payload.valid_until ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "valid_until", setPayload)
                }
                size="small"
                fullWidth
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Per user limit (default 1)</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.per_user_limit ?? ""}
                onChange={(e) =>
                  payloadHandler(
                    payload,
                    e.target.value === "" ? null : Number(e.target.value),
                    "per_user_limit",
                    setPayload
                  )
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Max seats per use</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.max_quantity_per_use ?? ""}
                onChange={(e) =>
                  payloadHandler(
                    payload,
                    e.target.value === "" ? null : Number(e.target.value),
                    "max_quantity_per_use",
                    setPayload
                  )
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Total seats limit</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.max_total_quantity ?? ""}
                onChange={(e) =>
                  payloadHandler(
                    payload,
                    e.target.value === "" ? null : Number(e.target.value),
                    "max_total_quantity",
                    setPayload
                  )
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Min order amount (MMK)</InputLabel>
              <OutlinedInput
                type="number"
                value={payload.min_order_amount ?? ""}
                onChange={(e) =>
                  payloadHandler(
                    payload,
                    e.target.value === "" ? null : Number(e.target.value),
                    "min_order_amount",
                    setPayload
                  )
                }
              />
            </Stack>
          </Grid>

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
            cancelClick={() => navigate(paths.coupons)}
            submit="Create"
            submitClick={submit}
            loading={loading}
          />

          {generatedCodes && (
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Generated coupon codes</InputLabel>
                <TextField
                  value={generatedCodes}
                  multiline
                  minRows={6}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <Typography variant="caption" color="text.secondary">
                  Copy these codes and use them in your banner.
                </Typography>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>
    </div>
  );
};

