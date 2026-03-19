import { useEffect, useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { useSelector } from "react-redux";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const FilterByDate = (props) => {
  const { onFilter } = props;

  const { startFilterDate, endFilterDate } = useSelector(
    (state) => state.share
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (startDate !== null && endDate !== null) {
      onFilter({
        startDate: startDate ? startDate : startFilterDate,
        endDate: endDate ? endDate : endFilterDate,
      });
    }
  }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker", "DatePicker"]}>
        <div className="flex gap-3">
          <Grid item sx={{ marginRight: 0.5 }} width={"200px"}>
            <DatePicker
              label="Start Date"
              value={startFilterDate}
              timezone="UTC"
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
              inputFormat="yyyy-MM-dd"
            />
          </Grid>
          <Grid item width={"200px"}>
            <DatePicker
              label="End Date"
              value={endFilterDate}
              timezone="UTC"
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Grid>
        </div>
      </DemoContainer>
    </LocalizationProvider>
  );
};
