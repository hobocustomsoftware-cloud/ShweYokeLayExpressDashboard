import {
  Box,
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
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { endpoints } from "../../constants/endpoints";
import { getRequest, putRequest } from "../../helpers/api";
import { httpServiceHandler } from "../../helpers/handler";
import { updateNotification } from "../../shares/shareSlice";

export const PromotionPopupPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [codesText, setCodesText] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await getRequest(endpoints.promotionConfig);
    if (res?.status === 200 && res?.data) {
      setEnabled(!!res.data.popup_enabled);
      setValidFrom(res.data.popup_valid_from ?? "");
      setValidUntil(res.data.popup_valid_until ?? "");
      setLogoUrl(res.data.popup_logo_url ?? "");
      const items = Array.isArray(res.data.popup_items) ? res.data.popup_items : [];
      setCodesText(
        items
          .map((i) => {
            const code = i?.code ?? "";
            const title = i?.title ?? "";
            const subtitle = i?.subtitle ?? "";
            return [code, title, subtitle].filter((x) => x !== "").join(" | ");
          })
          .filter(Boolean)
          .join("\n")
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const items = (codesText ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const code = parts[0] ?? "";
        const title = parts[1] ?? null;
        const subtitle = parts[2] ?? null;
        return {
          code,
          title: title || null,
          subtitle: subtitle || null,
        };
      })
      .filter((it) => !!it.code);

    const res = await putRequest(endpoints.promotionConfig, {
      popup_enabled: enabled,
      popup_valid_from: validFrom || null,
      popup_valid_until: validUntil || null,
      popup_logo_url: logoUrl || null,
      popup_items: items,
    });
    await httpServiceHandler(dispatch, res);
    if (res?.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: "Promotion popup saved.",
        })
      );
    }
    setSaving(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Mini2 Promotion Popup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mini2 app စဝင်ချင်း popup ပေါ်မယ် (တစ်နေ့တစ်ခါ)။ Coupon code ကို copy/paste လုပ်ခိုင်းဖို့။
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                }
                label="Enable popup"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Valid from</InputLabel>
                <TextField
                  type="datetime-local"
                  value={validFrom ?? ""}
                  onChange={(e) => setValidFrom(e.target.value)}
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
                  value={validUntil ?? ""}
                  onChange={(e) => setValidUntil(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Logo URL (optional)</InputLabel>
                <OutlinedInput value={logoUrl ?? ""} onChange={(e) => setLogoUrl(e.target.value)} />
                <Typography variant="caption" color="text.secondary">
                  Example: `https://.../logo.png` or `/images/brand.png`
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Popup items (one per line)</InputLabel>
                <TextField
                  value={codesText}
                  onChange={(e) => setCodesText(e.target.value)}
                  multiline
                  minRows={6}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  Format: `CODE | TITLE | DURATION` (TITLE / DURATION optional). Example:
                  <br />
                  `SYL001 | SAVE 10% | Valid for 7 days.`
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

