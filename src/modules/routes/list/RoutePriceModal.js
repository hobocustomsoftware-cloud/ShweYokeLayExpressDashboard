import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getRequest, postRequest, delRequest } from "../../../helpers/api";

export const RoutePricesModal = ({
  open,
  handleClose,
  routeId,
  routeName,
  busType,
}) => {
  const [prices, setPrices] = useState([]);
  const safePrices = Array.isArray(prices) ? prices : [];

  const [newPrice, setNewPrice] = useState({
    start_date: "",
    end_date: "",
    local_price: "",
    foreign_price: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchPrices = async () => {
    if (!routeId) return;
    setLoading(true);
    const res = await getRequest(`/routes/${routeId}/prices`);
    console.log(res);
    if (res.status === 200) setPrices(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
  }, [routeId]);

  const handleAddPrice = async () => {
    if (!newPrice.start_date || !newPrice.local_price)
      return alert("Start Date and Local Price required");

    const res = await postRequest(`/routes/${routeId}/prices`, newPrice);
    if (res.status === 200) {
      setNewPrice({
        start_date: "",
        end_date: "",
        local_price: "",
        foreign_price: "",
      });
      await fetchPrices(); // <- FIX (wait for update)
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this price?")) return;
    const res = await delRequest(`/routes/${routeId}/prices/${id}`);
    if (res.status === 200) fetchPrices();
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    // Extract parts
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const year = String(date.getFullYear()).slice(2); // last 2 digits
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{`Manage Route Prices for ${routeName} ${busType}`}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
          <Grid item xs={4}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={newPrice.start_date}
              onChange={(e) =>
                setNewPrice({ ...newPrice, start_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={newPrice.end_date}
              onChange={(e) =>
                setNewPrice({ ...newPrice, end_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Local Price"
              type="number"
              fullWidth
              value={newPrice.local_price}
              onChange={(e) =>
                setNewPrice({ ...newPrice, local_price: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Foreigner Price"
              type="number"
              fullWidth
              value={newPrice.foreign_price}
              onChange={(e) =>
                setNewPrice({ ...newPrice, foreign_price: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPrice}
            >
              Add Price
            </Button>
          </Grid>
        </Grid>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Local Price</TableCell>
                <TableCell>Foreigner Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : safePrices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No prices found.</TableCell>
                </TableRow>
              ) : (
                safePrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>{formatDateTime(price.start_date)}</TableCell>
                    <TableCell>{formatDateTime(price.end_date)}</TableCell>
                    <TableCell>{price.price}</TableCell>
                    <TableCell>{price.fprice}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(price.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
