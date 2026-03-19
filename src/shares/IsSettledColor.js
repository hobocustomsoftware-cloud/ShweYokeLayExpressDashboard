import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const StatusBox = styled(Box)(({ theme, status }) => ({
  display: "inline-block",
  padding: "3px 6px",
  borderRadius: "20px",
  backgroundColor: getStatusColor(status),
}));

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "YES":
      return "#4CAF50";
    case "NO":
      return "#FFC107";
    default:
      return "#FFC107";
  }
};

const IsSettledColor = ({ value }) => {
  return (
    <StatusBox status={value}>
      <Typography variant="subtitle2">{value}</Typography>
    </StatusBox>
  );
};

export default IsSettledColor;
