// import { Grid, Paper, Typography } from "@mui/material";

const AnalyticEcommerce = ({ title, count, color = "bg-gray-100" }) => (
  <div className={`rounded-lg p-4 text-center shadow-md ${color}`}>
    <h6 className="mb-2 text-sm font-medium text-gray-500">{title}</h6>
    <div className="text-lg font-semibold text-blue-600">{count}</div>
  </div>
);

export default AnalyticEcommerce;

// <Paper elevation={5} sx={{ padding: 2, textAlign: "center" }} color="#bad7fa">
//   <Typography variant="h6" color="textSecondary" gutterBottom>
//     {title}
//   </Typography>
//   <Typography variant="h6" color="primary">
//     {count}
//   </Typography>
// </Paper>
