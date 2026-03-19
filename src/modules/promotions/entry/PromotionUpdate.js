import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../../constants/paths";
import { promotionPayload } from "../promotionPayload";
import { promotionService } from "../promotionService";
import { PromotionForm } from "./PromotionForm";
import { getRequest } from "../../../helpers/api";
import { endpoints } from "../../../constants/endpoints";

export const PromotionUpdate = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [values, setValues] = useState(promotionPayload.update);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const toFormData = (v) => {
    const fd = new FormData();
    Object.entries(v ?? {}).forEach(([k, val]) => {
      if (val === undefined || val === null) return;
      if (k === "popup_image") return; // prevent URL-style editing; upload only
      if (String(k).startsWith("_")) return;
      if (typeof val === "boolean") fd.append(k, val ? "1" : "0");
      else fd.append(k, val);
    });
    return fd;
  };

  const load = async () => {
    setLoading(true);
    const res = await promotionService.show(dispatch, id);
    if (res?.status === 200) {
      // backend returns in { message, data }
      const p = res.data ?? {};
      setValues((prev) => ({
        ...prev,
        ...p,
        // datetime-local expects "YYYY-MM-DDTHH:mm"
        start_date: (p.start_date ?? "").slice(0, 16),
        end_date: (p.end_date ?? "").slice(0, 16),
        popup_image_file: null,
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadCoupons = async () => {
      const res = await getRequest(endpoints.coupons, { page: 1, per_page: 200, sort: "DESC", order: "id" });
      if (res?.status !== 200) return;
      const list = res?.data?.data ?? [];
      setCoupons(Array.isArray(list) ? list : []);
    };
    loadCoupons();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await promotionService.update(dispatch, id, toFormData(values));
    setSaving(false);
    if (res?.status === 200) navigate(paths.promotions);
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  return (
    <PromotionForm
      title="Update Promotion"
      values={values}
      setValues={setValues}
      onSubmit={save}
      submitting={saving}
      coupons={coupons}
    />
  );
};

