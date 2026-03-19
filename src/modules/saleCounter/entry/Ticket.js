import { GrLocation, GrMapLocation } from "react-icons/gr";

import { CiClock2 } from "react-icons/ci";
import { FaArrowRight } from "react-icons/fa";
import PropTypes from "prop-types";
import { formatTo12Hour } from "../../../helpers/datetime";
import { setSelectedRoute } from "../bookingInformationSlice";
import { useDispatch } from "react-redux";

const Ticket = ({ value }) => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  // const location = useLocation();
  const handleBuyTicket = () => {
    // const isUserValid = getData(keys.USER);
    // if (!isUserValid) {
    //   // console.log("User not logged in, redirecting to login page");
    //   navigate("/login", { state: { previousPath: location }, replace: true });
    //   return;
    // }
    // if (isUserValid) {
    //   console.log('here ', isUserValid.is_admin);
    // }
    // const orders = value?.orders?.map((order) => {
    //   try {
    //     const seats = JSON.parse(order.seat); // Parse seat JSON safely
    //     if (!Array.isArray(seats)) return []; // Ensure it's an array

    //     return seats.map((seat) => ({
    //       number: seat?.number ?? null, // Use null if undefined
    //       type: seat?.type ?? "Unknown", // Use "Unknown" if undefined
    //       sold: true,
    //     }));
    //   } catch (error) {
    //     console.error("Invalid JSON in order.seat:", order.seat, error);
    //     return []; // Return empty array if parsing fails
    //   }
    // });
    // console.log("orders:", orders);

    // const updatedValue = {
    //   ...value,
    //   price:
    //     params?.selected_user_type === "foreigner"
    //       ? value?.fprice
    //       : value?.price,
    // };

    // const respectivePrice =
    //   params?.selected_user_type === "foreigner" ? value?.fprice : value?.price;
    // dispatch(
    //   updateBookingInformation({
    //     selectedDate: params?.selected_date,
    //   })
    // );

    console.log("value in ticket ", value);

    dispatch(
      setSelectedRoute({
        id: value.id,
        startingPoint: value.starting_point,
        endingPoint: value.ending_point,
        busType: value.vehicles_type.name,
        duration: value.duration,
        price: value.ticket_fee,
        facilities: value.vehicles_type.facilities,
        departureTime: value.departure,
        arrivalTime: value.arrivals,
        layout: value.vehicles_type.seat_layout,
        name: value.name,
      })
    );

    // navigate("/step", {
    //   state: { value: { ...updatedValue, ...params }, orders: orders.flat() },
    // });
  };

  return (
    <div className="flex flex-col pt-8 pb-7 border border-gray-500 rounded-2xl bg-[#fafbfc] shadow-lg text-lg">
      {/* <button
        type="button"
        onClick={() => {
          handleBuyTicket();
        }}
        className="bg-gray-50 hover:bg-secondary-0 px-5 py-[7px] border-none rounded-sm text-[14px] font-semibold transition-colors duration-400 "
      ></button> */}

      <div>
        <div className="pb-5 md:pb-0 flex flex-col md:flex-row items-center border-b border-b-gray-400 border-dashed">
          {/* time + bus type */}
          <div className="w-full md:w-[25%] text-center">
            <span className="block text-2xl font-bold">
              {formatTo12Hour(value?.departure)}
            </span>
            <span className="block text-2xl font-bold">
              {value?.vehicles_type_id}
            </span>
          </div>
          {/* from + to */}
          <div className="w-full md:w-[50%] px-5 md:px-0">
            <h2>Route</h2>

            <div className="mt-3 flex justify-between items-center pb-5">
              <div>
                <GrLocation
                  color="#000"
                  size={30}
                  className="customIconWeight inline-block w-6 h-6 mr-3"
                />
                <span>{value?.start}</span>
              </div>
              <FaArrowRight />
              <div>
                <GrMapLocation
                  color="#000"
                  size={30}
                  className="customIconWeight inline-block w-6 h-6 mr-3"
                />
                <span>{value?.destination}</span>
              </div>
            </div>

            <div className="pb-5">
              <CiClock2
                color="#000"
                size={30}
                className="customIconWeight inline-block w-6 h-6 mr-3"
              />
              <span>Estimated Duration: {value?.duration}</span>
            </div>
            <div className="text-center m-2 font-semibold">
              <h3>{value.name}</h3>
            </div>
          </div>
          {/* price + button */}
          <div className="w-full md:w-[25%] flex flex-col items-center justify-center text-center">
            <span className="block text-2xl w-[180px] font-bold pb-3">
              {value?.ticket_fee}
              MMK
            </span>
          </div>
        </div>

        {/* Facilities */}
        <div className="px-5 md:px-20 pt-6 text-sm md:text-lg">
          <span className="pr-3">Facilities:</span>

          {JSON.parse(value?.vehicles_type?.facilities).map((v, index) => {
            return (
              <p
                key={index}
                className="inline-block px-3 py-1 border border-gray-500 rounded-lg mr-3 mb-2"
              >
                {v}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
Ticket.propTypes = {
  value: PropTypes.object.isRequired,
  // params: PropTypes.shape({
  //   selected_date: PropTypes.any,
  //   selected_user_type: PropTypes.string,
  // }).isRequired,
  orders: PropTypes.array,
};

export default Ticket;
