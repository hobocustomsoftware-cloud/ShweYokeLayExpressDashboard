import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../../constants/paths";
import { promotionService } from "../promotionService";

export const PromotionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await promotionService.index(dispatch);
    if (res?.status === 200) {
      const list = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  };

  const onDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this promotion?");
    if (!ok) return;
    setDeletingId(id);
    await promotionService.destory(dispatch, id);
    setDeletingId(null);
    load();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Promotions</Typography>
          <Button component={Link} to={paths.promotionsCreate} variant="contained">
            Create
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Coupon</TableCell>
                <TableCell>%</TableCell>
                <TableCell>Display</TableCell>
                <TableCell>Checkout</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Platforms</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  onClick={() => navigate(`${paths.promotions}/${p.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.coupon_code}</TableCell>
                  <TableCell>{p.discount_percentage}</TableCell>
                  <TableCell>{p.display_type}</TableCell>
                  <TableCell>{p.show_on_checkout ? "Yes" : "No"}</TableCell>
                  <TableCell>{p.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {[p.show_on_web && "Web", p.show_on_mini_app && "Mini2", p.show_on_android && "Android", p.show_on_ios && "iOS"]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Button component={Link} to={`${paths.promotions}/${p.id}`} size="small">
                      Edit
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      disabled={deletingId === p.id}
                      onClick={() => onDelete(p.id)}
                    >
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

