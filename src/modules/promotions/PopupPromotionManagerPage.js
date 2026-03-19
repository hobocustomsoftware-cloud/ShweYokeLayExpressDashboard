import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { promotionService } from "./promotionService";

const toDatetimeLocal = (iso) => (iso ? String(iso).slice(0, 16) : "");

export const PopupPromotionManagerPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [promotionId, setPromotionId] = useState(null);
  const [title, setTitle] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showOnWeb, setShowOnWeb] = useState(false);
  const [showOnMiniApp, setShowOnMiniApp] = useState(true);
  const [showOnAndroid, setShowOnAndroid] = useState(false);
  const [showOnIos, setShowOnIos] = useState(false);

  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [popupImageFile, setPopupImageFile] = useState(null);

  const localPreviewUrl = useMemo(() => {
    if (!popupImageFile) return "";
    return URL.createObjectURL(popupImageFile);
  }, [popupImageFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const load = async () => {
    setLoading(true);
    const res = await promotionService.index(dispatch);
    if (res?.status === 200) {
      const list = res.data?.data ?? res.data ?? [];
      const items = Array.isArray(list) ? list : [];

      // latest popup/both promotion (used for popup)
      const latest = items.find((p) => p?.display_type === "popup" || p?.display_type === "both") ?? null;

      if (latest) {
        setPromotionId(latest.id);
        setTitle(latest.title ?? "");
        setDiscountText(latest.discount_text ?? "");
        setCouponCode(latest.coupon_code ?? "");
        setStartDate(toDatetimeLocal(latest.start_date));
        setEndDate(toDatetimeLocal(latest.end_date));
        setIsActive(!!latest.is_active);

        setShowOnWeb(!!latest.show_on_web);
        setShowOnMiniApp(!!latest.show_on_mini_app);
        setShowOnAndroid(!!latest.show_on_android);
        setShowOnIos(!!latest.show_on_ios);

        setPopupImageUrl(latest.popup_image ?? "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);

    const form = new FormData();
    form.append("title", title || "");
    form.append("discount_text", discountText || "");
    form.append("coupon_code", couponCode || "");

    // popup system uses display_type=popup
    form.append("display_type", "popup");

    // required by backend promotion schema
    form.append("discount_percentage", "0");
    form.append("start_date", startDate || "");
    form.append("end_date", endDate || "");
    form.append("is_active", isActive ? "1" : "0");

    form.append("show_on_web", showOnWeb ? "1" : "0");
    form.append("show_on_mini_app", showOnMiniApp ? "1" : "0");
    form.append("show_on_android", showOnAndroid ? "1" : "0");
    form.append("show_on_ios", showOnIos ? "1" : "0");

    if (popupImageFile) {
      form.append("popup_image_file", popupImageFile);
    } else if (popupImageUrl) {
      // fallback: allow manual URL too
      form.append("popup_image", popupImageUrl);
    }

    const res = promotionId
      ? await promotionService.update(dispatch, promotionId, form)
      : await promotionService.store(dispatch, form);

    setSaving(false);
    if (res?.status === 200) load();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Popup Promotion Manager
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage the popup banner (image upload, discount text, coupon code, and platform visibility).
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                label="Active"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Title</InputLabel>
                <TextField value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Discount Text</InputLabel>
                <TextField
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="SAVE 10%"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Coupon Code</InputLabel>
                <TextField
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="SYL001"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Popup Banner Image</InputLabel>
                <Button variant="outlined" component="label">
                  Upload image
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPopupImageFile(f);
                    }}
                  />
                </Button>
                <TextField
                  value={popupImageUrl}
                  onChange={(e) => setPopupImageUrl(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Or paste image URL (optional)"
                />
                {(localPreviewUrl || popupImageUrl) && (
                  <Box
                    sx={{
                      mt: 1,
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 1,
                      overflow: "hidden",
                      maxWidth: 420,
                    }}
                  >
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img
                      src={localPreviewUrl || popupImageUrl}
                      alt="Popup banner preview"
                      style={{ width: "100%", display: "block" }}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <InputLabel>Start date</InputLabel>
                <TextField
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
                  control={<Checkbox checked={showOnWeb} onChange={(e) => setShowOnWeb(e.target.checked)} />}
                  label="Website"
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={showOnMiniApp} onChange={(e) => setShowOnMiniApp(e.target.checked)} />
                  }
                  label="KBZ Mini App"
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={showOnAndroid} onChange={(e) => setShowOnAndroid(e.target.checked)} />
                  }
                  label="Android Native"
                />
                <FormControlLabel
                  control={<Checkbox checked={showOnIos} onChange={(e) => setShowOnIos(e.target.checked)} />}
                  label="iOS Native"
                />
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

