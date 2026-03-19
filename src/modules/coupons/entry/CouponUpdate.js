import {
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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

export const CouponUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(couponPayload.update);
  const { coupon } = useSelector((state) => state.coupons);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const loadingData = useCallback(async () => {
    setLoading(true);
    await couponService.show(dispatch, params.id);
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (coupon) {
      setPayload({
        ...couponPayload.update,
        ...coupon,
        channels: coupon.channels ?? [],
      });
    }
  }, [coupon]);

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
    // Coupon type not selectable: default percentage
    submitPayload.type = "percentage";
    if (submitPayload.valid_from === "") submitPayload.valid_from = null;
    if (submitPayload.valid_until === "") submitPayload.valid_until = null;
    const res = await couponService.update(dispatch, params.id, submitPayload);
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
              <InputLabel>Coupon Code</InputLabel>
              <OutlinedInput
                value={payload.code ?? ""}
                onChange={(e) =>
                  payloadHandler(payload, e.target.value, "code", setPayload)
                }
              />
              <ValidationMessage field={"code"} />
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

          {[
            ["per_user_limit", "Per user limit (default 1)"],
            ["max_quantity_per_use", "Max seats per use"],
            ["max_total_quantity", "Total seats limit"],
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
            cancelClick={() => navigate(paths.coupons)}
            submit="Update"
            submitClick={submit}
            loading={loading}
          />
        </Grid>
      </Paper>
    </div>
  );
};

