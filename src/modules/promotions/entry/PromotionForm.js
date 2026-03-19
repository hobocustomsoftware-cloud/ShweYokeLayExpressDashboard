import {
  Box,
  Button,
  Checkbox,
  FormControl,
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
import { useEffect, useMemo, useState } from "react";

export const PromotionForm = ({ title, values, setValues, onSubmit, submitting, coupons = [] }) => {
  const set = (key) => (e) => {
    const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((p) => ({ ...p, [key]: v }));
  };

  const [popupImageFile, setPopupImageFile] = useState(null);
  const [popupImgError, setPopupImgError] = useState(false);
  const previewUrl = useMemo(() => {
    if (!popupImageFile) return "";
    return URL.createObjectURL(popupImageFile);
  }, [popupImageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Pick coupon (auto fill code + duration)</InputLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={values._coupon_id ?? ""}
                  onChange={(e) => {
                    const couponId = e.target.value;
                    setValues((p) => ({ ...p, _coupon_id: couponId }));
                    const c = (coupons ?? []).find((x) => String(x?.id) === String(couponId));
                    if (!c) return;

                    const code = (c?.code ?? c?.coupon_code ?? "").toString().trim();
                    const from = (c?.valid_from ?? c?.validFrom ?? c?.start_date ?? "").toString();
                    const until = (c?.valid_until ?? c?.validUntil ?? c?.end_date ?? "").toString();
                    const type = c?.type;
                    const value = c?.value;

                    setValues((prev) => ({
                      ...prev,
                      coupon_code: code || prev.coupon_code,
                      start_date: (from || prev.start_date || "").slice(0, 16),
                      end_date: (until || prev.end_date || "").slice(0, 16),
                      // auto-fill discount % from Coupon create/edit
                      discount_percentage: type === "percentage" ? Number(value ?? 0) : prev.discount_percentage,
                      discount_text:
                        type === "percentage"
                          ? `SAVE ${value ?? ""}%`
                          : value != null
                            ? `SAVE ${value}`
                            : prev.discount_text,
                    }));
                  }}
                >
                  <MenuItem value="">(Select coupon)</MenuItem>
                  {(coupons ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code}{" "}
                      {c.valid_from || c.valid_until
                        ? `(${String(c.valid_from ?? "").slice(0, 10)} → ${String(c.valid_until ?? "").slice(0, 10)})`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Coupon create/edit မှာလုပ်ထားတဲ့ code + valid from/until ကို ဒီနေရာမှာ auto-fill လုပ်ပေးမယ်။
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Popup Image (upload)</InputLabel>
              <Button variant="outlined" component="label" disabled={submitting}>
                Upload popup image
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPopupImageFile(file);
                    setPopupImgError(false);
                    setValues((p) => ({ ...p, popup_image_file: file }));
                  }}
                />
              </Button>

              {(previewUrl || values.popup_image) && (
                <Box
                  sx={{
                    mt: 1,
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 1,
                    overflow: "hidden",
                    maxWidth: 520,
                  }}
                >
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img
                    src={previewUrl || values.popup_image}
                    alt="Popup image preview"
                    style={{ width: "100%", display: "block" }}
                    onError={() => setPopupImgError(true)}
                  />
                </Box>
              )}

              <Typography variant="caption" color="text.secondary">
                This will upload as `popup_image_file` (no URL input).
              </Typography>

              {!previewUrl && values.popup_image ? (
                <Typography variant="caption" color={popupImgError ? "error" : "text.secondary"}>
                  {popupImgError
                    ? "Preview cannot load. Please ensure backend `public/storage` is linked (php artisan storage:link) and image URL is accessible."
                    : `Current: ${values.popup_image}`}
                </Typography>
              ) : null}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Discount Text</InputLabel>
              <OutlinedInput value={values.discount_text ?? ""} onChange={set("discount_text")} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Title</InputLabel>
              <OutlinedInput value={values.title ?? ""} onChange={set("title")} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Coupon code</InputLabel>
              <OutlinedInput value={values.coupon_code ?? ""} onChange={set("coupon_code")} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Discount %</InputLabel>
              <OutlinedInput
                type="number"
                value={values.discount_percentage ?? 0}
                onChange={set("discount_percentage")}
              />
            </Stack>
          </Grid>

          {/* Removed banner_image URL input (use popup image upload) */}

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Display type</InputLabel>
              <FormControl fullWidth size="small">
                <Select value={values.display_type ?? "both"} onChange={set("display_type")}>
                  <MenuItem value="popup">popup</MenuItem>
                  <MenuItem value="checkout_inline">checkout_inline</MenuItem>
                  <MenuItem value="both">both</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Status</InputLabel>
              <FormControlLabel
                control={<Checkbox checked={!!values.is_active} onChange={set("is_active")} />}
                label="Active"
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!values.show_on_checkout}
                  onChange={set("show_on_checkout")}
                />
              }
              label="Show on Checkout (Ads banner above Total Price)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Start date</InputLabel>
              <TextField
                type="datetime-local"
                value={values.start_date ?? ""}
                onChange={set("start_date")}
                size="small"
                fullWidth
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>End date</InputLabel>
              <TextField
                type="datetime-local"
                value={values.end_date ?? ""}
                onChange={set("end_date")}
                size="small"
                fullWidth
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Platforms
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <FormControlLabel
                control={<Checkbox checked={!!values.show_on_web} onChange={set("show_on_web")} />}
                label="Website"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={!!values.show_on_mini_app} onChange={set("show_on_mini_app")} />
                }
                label="KBZ Mini2"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={!!values.show_on_android} onChange={set("show_on_android")} />
                }
                label="Android App"
              />
              <FormControlLabel
                control={<Checkbox checked={!!values.show_on_ios} onChange={set("show_on_ios")} />}
                label="iOS App"
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Grid>

          {/* Preview (Dashboard) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Preview (Popup + Checkout)
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box
                sx={{
                  width: 420,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.12)",
                }}
              >
                <Box sx={{ px: 1.5, py: 1, bgcolor: "#f8fafc" }}>
                  <Typography variant="caption">Popup preview</Typography>
                </Box>
                <Box
                  sx={{
                    height: 210,
                    position: "relative",
                    bgcolor: "#111827",
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl || values.popup_image || ""}
                    alt="Popup preview"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      bgcolor: "#0b1220",
                    }}
                  />
                  <Box sx={{ position: "absolute", left: 16, top: 16, right: 16 }}>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                      }}
                    >
                      {values.discount_text || "SAVE 10%"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                      border: "1px solid rgba(255,255,255,0.6)",
                      bgcolor: "rgba(0,0,0,0.15)",
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        letterSpacing: 1,
                        fontSize: 18,
                        textAlign: "center",
                        textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                      }}
                    >
                      {values.coupon_code || "SYL001"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  width: 420,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.12)",
                }}
              >
                <Box sx={{ px: 1.5, py: 1, bgcolor: "#f8fafc" }}>
                  <Typography variant="caption">Checkout banner preview</Typography>
                </Box>
                <Box
                  sx={{
                    height: 150,
                    position: "relative",
                    bgcolor: "#0b1220",
                    opacity: values.show_on_checkout ? 1 : 0.5,
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl || values.popup_image || ""}
                    alt="Checkout preview"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <Box sx={{ position: "absolute", left: 14, top: 14, right: 14 }}>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                        fontSize: 14,
                      }}
                    >
                      {values.discount_text || "SAVE 10%"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 14,
                      right: 14,
                      bottom: 14,
                      border: "1px solid rgba(255,255,255,0.6)",
                      bgcolor: "rgba(0,0,0,0.15)",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        letterSpacing: 1,
                        fontSize: 16,
                        textAlign: "center",
                        textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                      }}
                    >
                      {values.coupon_code || "SYL001"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

