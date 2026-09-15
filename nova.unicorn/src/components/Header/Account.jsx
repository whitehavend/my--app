import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineGift } from "react-icons/hi";
import { FaRegEnvelope } from "react-icons/fa";
import { MdOutlineFavoriteBorder, MdCreditCard } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { clearCart } from "../../Store/cart/CartSlice";

const Account = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const signOutHandler = () => {
    dispatch(clearCart());
    localStorage.removeItem("unicorn_token");
    navigate("/");
  };

  return (
    <div className="absolute top-[165px] right-72 2xl:right-80 2xl-custom:right-96 bg-white w-[220px] rounded-md border border-stone-200 z-10">
      {user ? (
        <div className="py-4 mx-4">
          <button onClick={signOutHandler} className="w-full bg-primary rounded-md text-white px-3 py-2 hover:bg-primary100 shadow-md">
            LOG OUT
          </button>
        </div>
      ) : (
        <Link to="/login">
          <div className="py-4 mx-4">
            <button className="w-full bg-primary rounded-md text-white px-3 py-2 hover:bg-primary100 shadow-md">SIGN IN</button>
          </div>
        </Link>
      )}

      <div className="border-t-2 border-[#f1f1f2] mt-2 ">
        <p className="group flex items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <HiOutlineUser className="text-2xl" />
          <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">My Account</span>
        </p>

        <button
          onClick={() => navigate(user ? "/orders" : "/login")}
          className="group flex items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer w-full text-left"
        >
          <HiOutlineGift className="text-2xl" />
          <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">Orders</span>
        </button>

        {user && user.role === "vendor" && user.isApproved !== false && (
          <button
            onClick={() => navigate("/vendor/products/new")}
            className="group flex w-full items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300] cursor-pointer text-left"
          >
            <FaRegEnvelope className="text-2xl" />
            <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">Upload product</span>
          </button>
        )}

        {user && (
          <button
            onClick={() => navigate("/admin/vendors")}
            className="group flex w-full items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer text-left"
          >
            <FaRegEnvelope className="text-2xl" />
            <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">Vendor approvals</span>
          </button>
        )}

        <p className="group flex items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <MdOutlineFavoriteBorder className="text-2xl" />
          <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">Saved Items</span>
        </p>

        {user && (
          <p className="group flex items-center p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
            <MdCreditCard className="text-2xl" />
            <span className="text-[grey] pl-2 text-sm group-hover:text-[black]">Vouchers</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Account;