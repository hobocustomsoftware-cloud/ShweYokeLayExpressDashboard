import { forwardRef } from "react";
// used in hiding date picker on click keyboard
export const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="w-full focus:outline-none hover:cursor-pointer"
    onClick={onClick}
    value={value}
    readOnly
    ref={ref}
  />
));
CustomInput.displayName = "CustomInput";

export const facilityBoxStyle = {
  height: "28px",
  fontSize: "12px",
  padding: "0.25rem",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#6B7280",
  borderRadius: "0.5rem",
  textAlign: "center",
};
export const ticketBoxStyle = {
  textAlign: "center",
  minWidth: "40px",
  fontSize: "12px",
  padding: "4px 12px",
  height: "fit-content",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#6B7280",
  borderRadius: "0.5rem",
};
export const labelText = {
  textAlign: "center",
};
export const seatTypeColors = {
  available: { name: "Available", color: "bg-green-400", sold: true },
  man: { name: "Man", color: "bg-blue-500", sold: true },
  woman: { name: "Woman", color: "bg-pink-600", sold: true },
  monk: { name: "Monk", color: "bg-red-800", sold: true },
  nun: { name: "Nun", color: "bg-pink-300", sold: true },
  onhold: { name: "On Hold", color: "bg-gray-400", sold: false },
  locked: { name: "Locked", color: "bg-red-600", sold: false },
};
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export function formatTo12Hour(timeStr) {
  if (!timeStr) return "";

  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 → 12, 13 → 1, etc.

  return `${hour}:${minute} ${ampm}`;
}
