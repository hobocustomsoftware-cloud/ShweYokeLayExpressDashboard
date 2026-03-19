import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../constants/paths";
import { promotionPayload } from "../promotionPayload";
import { promotionService } from "../promotionService";
import { PromotionForm } from "./PromotionForm";
import { getRequest } from "../../../helpers/api";
import { endpoints } from "../../../constants/endpoints";

export const PromotionCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [values, setValues] = useState(promotionPayload.store);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const toFormData = (v) => {
    const fd = new FormData();
    Object.entries(v ?? {}).forEach(([k, val]) => {
      if (val === undefined || val === null) return;
      if (String(k).startsWith("_")) return;
      if (typeof val === "boolean") fd.append(k, val ? "1" : "0");
      else fd.append(k, val);
    });
    return fd;
  };

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
    const res = await promotionService.store(dispatch, toFormData(values));
    setSaving(false);
    if (res?.status === 200) navigate(paths.promotions);
  };

  return (
    <PromotionForm
      title="Create Promotion"
      values={values}
      setValues={setValues}
      onSubmit={save}
      submitting={saving}
      coupons={coupons}
    />
  );
};

