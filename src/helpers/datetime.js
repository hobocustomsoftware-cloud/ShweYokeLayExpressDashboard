import moment from "moment";

export const datetime = {
  long: (value) => {
    if (value) {
      return moment(value).format("DD MMM YYYY - hh:mm:ss");
    } else {
      return value;
    }
  },
};

// export const formatTo12Hour = (time) => {
//   // expects time as "HH:mm" or "HH:mm:ss"
//   if (!time) return "";

//   const [hourStr, minuteStr] = time.split(":");
//   let hour = parseInt(hourStr, 10);
//   const minutes = minuteStr?.padStart(2, "0") || "00";

//   const ampm = hour >= 12 ? "PM" : "AM";
//   hour = hour % 12 || 12; // convert 0 to 12

//   return `${hour}:${minutes} ${ampm}`;
// };
export const formatTo12Hour = (time) => {
  if (!time) return "";

  const [hourStr, minuteStr = "00", secondStr = "00"] = time.split(":");

  let hour = parseInt(hourStr, 10);
  const minutes = minuteStr.padStart(2, "0");
  const seconds = secondStr.padStart(2, "0");

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minutes} ${ampm}`;
};

export function formatDateToDdMmmYyyy(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }); // "Aug"
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

// export function formatDateToDateTime(dateInput) {
//   const date = new Date(dateInput);

//   if (isNaN(date.getTime())) return "Invalid Date";

//   const day = String(date.getDate()).padStart(2, "0");
//   const month = date.toLocaleString("en-US", { month: "short" });
//   const year = date.getFullYear();

//   // format hours & minutes in 12hr with AM/PM
//   let hours = date.getHours();
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12; // convert to 12-hour format

//   return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
// }

export function formatDateToDateTime(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // format hours, minutes & seconds in 12hr with AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day} ${month} ${year} ${hours}:${minutes} ${seconds}s ${ampm}`;
}

export function convertTo12HourFormat(time24) {
  if (!time24) return;
  const clean = time24.trim();

  if (!/^\d{1,2}:\d{2}$/.test(clean)) return "Invalid time";

  const [hourStr, minute] = clean.split(":");
  const hour = parseInt(hourStr, 10);

  if (hour < 0 || hour > 23 || parseInt(minute, 10) > 59) return "Invalid time";

  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute} ${ampm}`;
}
export function calculateArrivalTime(dateStr, departureTime, durationStr) {
  // Check if inputs are valid
  if (!dateStr || !departureTime || !durationStr) return "Invalid input";

  // Trim strings safely
  const departure = departureTime.toString().trim();
  const date = dateStr.toString().trim();
  const duration = durationStr.toString().trim();

  // Parse departure time
  const departureParts = departure.split(":");
  if (departureParts.length !== 2) return "Invalid input";
  const [hourStr, minuteStr] = departureParts;

  // Parse date
  const yearMonthDay = date.split("-");
  if (yearMonthDay.length !== 3) return "Invalid input";
  const [year, month, day] = yearMonthDay.map(Number);

  // Month map
  const monthMap = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Parse duration
  const match = duration.match(/^(\d+(\.\d+)?)\s*hours?$/i);
  if (!match) return "Invalid input";
  const hoursToAdd = parseFloat(match[1]);

  // Create date object
  const dateObj = new Date(
    year,
    month - 1,
    day,
    parseInt(hourStr, 10),
    parseInt(minuteStr, 10)
  );

  // Add duration in minutes
  dateObj.setMinutes(dateObj.getMinutes() + hoursToAdd * 60);

  // Format output
  const hour = dateObj.getHours() % 12 || 12;
  const minute = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";

  const formattedDate = `${hour}:${minute} ${ampm} ${String(
    dateObj.getDate()
  ).padStart(2, "0")} ${monthMap[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  return formattedDate;
}

// export const formatUtcToYangon = (utcString) => {
//   if (!utcString) return "";

//   const options = {
//     timeZone: "Asia/Yangon",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   };

//   const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(
//     new Date(utcString + " UTC")
//   );

//   const get = (type) => parts.find((p) => p.type === type)?.value || "";

//   const day = get("day");
//   const month = get("month");
//   const year = get("year");
//   const hour = get("hour");
//   const minute = get("minute");
//   const dayPeriod = get("dayPeriod");

//   return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`;
// };
export const formatUtcToYangon = (utcString) => {
  if (!utcString) return "";

  const options = {
    timeZone: "Asia/Yangon",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", // ✅ added
    hour12: true,
  };

  const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(
    new Date(utcString + " UTC")
  );

  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second"); // ✅ added
  const dayPeriod = get("dayPeriod");

  return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
};
