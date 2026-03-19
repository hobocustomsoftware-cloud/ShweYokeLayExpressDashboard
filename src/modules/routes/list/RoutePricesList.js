import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { delRequest, getRequest, postRequest } from "../../../helpers/api";

export default function RoutePricesPage() {
  const { id } = useParams(); // route ID
  console.log("Route ID:", id);
  const [prices, setPrices] = useState([]);
  const [newPrice, setNewPrice] = useState({
    start_date: "",
    end_date: "",
    price: "",
    fprice: "",
  });

  const loadPrices = async () => {
    const res = await getRequest(`/routes/${id}/prices`);
    if (res.status === 200) setPrices(res.data);
  };

  useEffect(() => {
    loadPrices();
  }, [id]);

  const handleCreate = async () => {
    await postRequest(`/routes/${id}/prices`, newPrice);
    setNewPrice({ start_date: "", end_date: "", price: "", fprice: "" });
    loadPrices();
  };

  const handleDelete = async (priceId) => {
    await delRequest(`/routes/${id}/prices/${priceId}`);
    loadPrices();
  };

  return (
    <Box>
      <h2>Route Prices Management</h2>

      <Box mb={2}>
        <TextField
          label="Start Date"
          type="date"
          value={newPrice.start_date}
          onChange={(e) =>
            setNewPrice({ ...newPrice, start_date: e.target.value })
          }
        />
        <TextField
          label="End Date"
          type="date"
          value={newPrice.end_date}
          onChange={(e) =>
            setNewPrice({ ...newPrice, end_date: e.target.value })
          }
        />
        <TextField
          label="Local Price"
          type="number"
          value={newPrice.price}
          onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
        />
        <TextField
          label="Foreigner Price"
          type="number"
          value={newPrice.fprice}
          onChange={(e) => setNewPrice({ ...newPrice, fprice: e.target.value })}
        />
        <Button onClick={handleCreate}>Add Price Rule</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Price (Local)</TableCell>
            <TableCell>Price (Foreigner)</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prices.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.start_date}</TableCell>
              <TableCell>{p.end_date || "-"}</TableCell>
              <TableCell>{p.price}</TableCell>
              <TableCell>{p.fprice}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleDelete(p.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
