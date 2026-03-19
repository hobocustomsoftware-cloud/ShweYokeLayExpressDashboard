import { Lock, LockOpen, Phone } from "@mui/icons-material";
import { baseURL, endpoints } from "../constants/endpoints";
import { getData, removeAllData } from "./localstorage";
import { keys, laravelDecrypt } from "../constants/config";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Steering from "../assets/image/steering.png";
import { paths } from "../constants/paths";
import { postRequest } from "./api";
import { seatTypeColors } from "./otherHelpers";
import { update } from "../modules/saleCounter/CloseSeatsSlice";
import { updateNotification } from "../shares/shareSlice";
import { useNavigate } from "react-router-dom";

const AdminVipSeatLock = ({ totalSeat }) => {
  const [modal, setModal] = useState({
    visible: false,
    seatNumber: null,
    mode: null,
    orderId: null,
  });
  const [choseSeats, setChoseSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [storeData, setStoreData] = useState({});
  const navigate = useNavigate();

  const logout = async () => {
    removeAllData();
    navigate(paths.adminLogout);
  };
  useEffect(() => {
    const init = async () => {
      if (Object.keys(storeData).length === 0) {
        const decrypted = await laravelDecrypt(getData(keys.CODE));
        if (!decrypted) {
          alert("Session Time Out!");
          logout();
        } else {
          setStoreData(decrypted);
        }
      }
    };
    init();
  }, []);

  const { userRole, permissions } = useSelector(
    (state) => state.bookingInformation
  );
  const canLock =
    storeData.role === "SUPER_ADMIN" ||
    permissions.some((p) => p === "Lock_Seat");
  const canUnlock =
    storeData.role === "SUPER_ADMIN" ||
    permissions.some((p) => p === "Unlock_Seat");

  const isLocked = (seatNumber) => lockedSeats.includes(seatNumber);

  const dispatch = useDispatch();
  const { bookedSeats, selectedSeat } = useSelector(
    (state) => state.bookingInformation
  );

  const { selectedRoute, selectedDate } = useSelector(
    (state) => state.closeSeats
  );

  const seatsPerRow = 3;
  const totalSeats = Number(totalSeat) || 0;

  const toggleSeat = (seatNumberValue) => {
    setChoseSeats((prev) => {
      const isSelected = prev.some((seat) => seat.number === seatNumberValue);
      let updated;

      if (isSelected) {
        updated = prev.filter((seat) => seat.number !== seatNumberValue);
      } else {
        const bookedSeat = bookedSeats
          .flat()
          .find((s) => s.number === seatNumberValue);
        if (bookedSeat && bookedSeat.status === "BOOKED") {
          setModal({
            visible: true,
            seatNumber: seatNumberValue,
            mode: "PAY",
            orderId: bookedSeat.order_id,
          });
        } else {
          setModal({
            visible: true,
            seatNumber: seatNumberValue,
            mode: "SEAT",
          });
        }
        updated = prev;
      }

      dispatch(update({ selectedSeat: updated }));
      return updated;
    });
  };

  const getSeatLabel = (index, seatsPerRow) => {
    const rowIndex = Math.floor(index / seatsPerRow); // 0-based row
    const seatIndex = index % seatsPerRow; // 0,1,2
    const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C...
    const seatNumber = seatsPerRow - seatIndex; // reverse numbering (3,2,1)

    const label = `${rowLetter}${seatNumber}`; // UI label
    const value = index + 1; // seat number for backend (1,2,3...)

    return { label, value, rowIndex, seatIndex };
  };

  // useEffect(() => {
  //   if (bookedSeats) {
  //     // for example, filter only active booked ones
  //     const updatedSeats = bookedSeats
  //       .flat()
  //       .filter((s) => s.status === "BOOKED");
  //     setChoseSeats(updatedSeats);
  //   }
  // }, [bookedSeats]);
  useEffect(() => {
    if (bookedSeats && bookedSeats.length > 0) {
      // Parse seat JSON for each booking record
      const parsed = bookedSeats.flatMap((booking) => {
        try {
          const seatList = JSON.parse(booking.seat || "[]");
          return seatList.map((s) => ({
            ...s,
            status: booking.status,
            order_id: booking.id, // keep reference
          }));
        } catch (err) {
          console.error("Failed to parse seat JSON:", booking.seat);
          return [];
        }
      });

      // Now you can easily identify both BOOKED and BLOCKED
      const activeBooked = parsed.filter((s) => s.status === "BOOKED");
      const blocked = parsed.filter((s) => s.status === "BLOCKED");

      setChoseSeats(activeBooked);
      setLockedSeats(blocked.map((s) => s.number));
    }
  }, [bookedSeats]);

  const handleLockUnlock = async () => {
    if (!modal.seatNumber) return;

    try {
      const isCurrentlyLocked = lockedSeats.includes(modal.seatNumber);

      const payload = {
        seatNumber: modal.seatNumber,
        order_id: modal.orderId || null,
        status: isCurrentlyLocked ? "UNBLOCKED" : "BLOCKED",
        type: isCurrentlyLocked ? "available" : "locked",
        routeId: selectedRoute,
        selectedDate: selectedDate,
      };

      const result = await postRequest(`${baseURL}/lockUnlock`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (result.status === 200) {
        dispatch(
          updateNotification({
            variant: "success",
            message: result.message,
          })
        );

        // Update local lockedSeats
        setLockedSeats(
          (prev) =>
            isCurrentlyLocked
              ? prev.filter((s) => s !== modal.seatNumber) // unlock
              : [...prev, modal.seatNumber] // lock
        );

        // Update modal orderId if backend created new booking
        if (!modal.orderId && result.data?.order_id) {
          setModal((prev) => ({ ...prev, orderId: result.data.order_id }));
        }

        // ✅ Only close modal if seat was locked, not unlocked
        if (!isCurrentlyLocked) {
          setModal((prev) => ({
            ...prev,
            visible: false,
            seatNumber: null,
            mode: null,
          }));
        }
        // If unlocked, keep modal open — user sees Unlock button change immediately
      } else {
        dispatch(
          updateNotification({
            variant: "error",
            message: result.message || "Error updating seat lock",
          })
        );
      }
    } catch (error) {
      console.error("Lock/Unlock error:", error);
      dispatch(
        updateNotification({
          variant: "error",
          message: error.response?.data?.message || "Something went wrong",
        })
      );
    }
  };

  return (
    <div className="flex flex-col items-center p-3">
      <h2 className="text-title font-semibold mb-4 bg-pink">VIP</h2>

      <div className="bg-gray-100 border border-black p-4 md:p-4 rounded-t-[3rem] rounded-b-3xl shadow-xl grid grid-cols-4 gap-4 pt-10 pb-8 relative w-fit">
        <div className="absolute rotate-270 top-1/2 left-2/3 -translate-x-2/3 -translate-y-1/2 col-span-1 flex items-center justify-center text-gray-500">
          Walkway
        </div>

        {/* Door */}
        <div className="absolute right-0 top-10 w-1 h-12 bg-gray-400 rounded-lg col-span-2"></div>

        <div className="flex justify-between col-span-4 row-span-1 relative">
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-lg">
            <img src={Steering} alt="Driver" />
          </div>
          <div className="w-16 h-16 flex items-center justify-center text-gray-500">
            Door
          </div>
        </div>

        {/* Passenger seats layout */}
        {Array.from({ length: totalSeats }, (_, index) => {
          const {
            label: seatLabel,
            value: seatValue,
            rowIndex,
            seatIndex,
          } = getSeatLabel(index, seatsPerRow);

          const selectedSeatData = selectedSeat.find(
            (seat) => seat.number === seatValue
          );
          const bookedSeatData = bookedSeats
            .flat()
            .find((seat) => seat.number === seatValue);

          const isSold = bookedSeatData?.status === "SUCCESS";
          const locked = isLocked(seatValue);

          // Determine seat type for color
          let seatType = "available";
          if (selectedSeatData) {
            seatType = selectedSeatData.type?.toLowerCase() || "available";
          } else if (bookedSeatData) {
            seatType = bookedSeatData.type?.toLowerCase() || "onhold";
          }

          let seatColor = seatTypeColors[seatType]?.color || "bg-green-400";

          if (isSold || bookedSeatData?.status === "BOOKED")
            seatColor += " opacity-50";
          if (locked) seatColor = "bg-red-600";

          return (
            <div
              key={seatValue}
              className={`min-w-12 min-h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg select-none
                  ${
                    isSold
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer"
                  }
                  ${seatColor}`}
              style={{
                gridRow: rowIndex + 2,
                gridColumn: [1, 2, 4, 1][seatIndex],
              }}
              onClick={() => {
                if (isSold) return; // ignore sold seats

                if (locked) {
                  // toggle lock/unlock directly
                  setModal({
                    visible: true,
                    seatNumber: seatValue,
                    mode: "SEAT",
                    orderId: bookedSeatData?.order_id || null,
                  });
                  handleLockUnlock();
                } else if (bookedSeatData?.status === "BOOKED") {
                  // open modal for payment
                  setModal({
                    visible: true,
                    seatNumber: seatValue,
                    mode: "PAY",
                    orderId: bookedSeatData.order_id,
                  });
                } else {
                  // normal seat selection
                  toggleSeat(seatValue);
                }
              }}
            >
              {seatLabel}
            </div>
          );
        })}
      </div>

      {/* Modal for choosing seat type + lock/unlock */}
      {modal.visible && modal.mode === "SEAT" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            {/* Lock / Unlock button */}
            <div className="flex justify-center mt-4">
              {isLocked(modal.seatNumber)
                ? canUnlock && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      onClick={handleLockUnlock}
                    >
                      <LockOpen /> Unlock
                    </button>
                  )
                : canLock && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      onClick={handleLockUnlock}
                    >
                      <Lock /> Lock
                    </button>
                  )}
            </div>

            {/* Close button */}
            <div className="absolute top-0 right-0">
              <button
                className="p-1 border-l-2 border-b-2 border-red-500 text-sm text-black hover:text-white hover:bg-red-200 rounded-lg"
                onClick={() =>
                  setModal({ visible: false, seatNumber: null, mode: null })
                }
              >
                <CloseIcon size={25} color="red" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVipSeatLock;
