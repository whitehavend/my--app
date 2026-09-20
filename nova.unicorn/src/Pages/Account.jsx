import { Navigate, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { clearCart } from "../Store/cart/CartSlice";
import { logout } from "../Store/auth/AuthSlice";
import { deleteAccount, updateAccountSettings } from "../Store/thunk";

const Account = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    secondName: user?.secondName || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    countryCode: user?.countryCode || "",
    deliveryAddress: user?.deliveryAddress || "",
    shopAddress: user?.shopAddress || "",
    shopName: user?.shopName || "",
    businessName: user?.businessName || "",
    password: "",
  });

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    const settings = { ...formData };
    if (!settings.password) delete settings.password;
    await dispatch(updateAccountSettings(settings));
    setFormData((current) => ({ ...current, password: "" }));
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const signOutHandler = () => {
    dispatch(clearCart());
    dispatch(logout());
    localStorage.removeItem("unicorn_token");
    navigate("/");
  };

  const deleteAccountHandler = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account?")) return;
    const result = await dispatch(deleteAccount());
    if (deleteAccount.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(logout());
      localStorage.removeItem("unicorn_token");
      localStorage.removeItem(`nova_saved_${user.uid}`);
      navigate("/");
    }
  };

  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-sm text-gray-500">My account</p>
            <h1 className="text-2xl font-semibold text-gray-900">Account details</h1>
          </div>
          <Link to="/orders" className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary100">
            View orders
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm text-gray-500">First name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          <div><label className="text-sm text-gray-500">Second name</label><input name="secondName" value={formData.secondName} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          <div><label className="text-sm text-gray-500">Username</label><input name="username" value={formData.username} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          <div><label className="text-sm text-gray-500">Phone number</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          <div><label className="text-sm text-gray-500">Country code</label><input name="countryCode" value={formData.countryCode} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          <div><label className="text-sm text-gray-500">New password</label><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" className="mt-1 w-full rounded-md border p-3" /></div>
          {(user.role === "customer") && <div className="sm:col-span-2"><label className="text-sm text-gray-500">Delivery address</label><input name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>}
          {(user.role === "vendor" || user.role === "blackmarket") && <>
            <div><label className="text-sm text-gray-500">Shop name</label><input name="shopName" value={formData.shopName} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
            <div><label className="text-sm text-gray-500">Business name</label><input name="businessName" value={formData.businessName} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
            <div className="sm:col-span-2"><label className="text-sm text-gray-500">Shop address</label><input name="shopAddress" value={formData.shopAddress} onChange={handleChange} className="mt-1 w-full rounded-md border p-3" /></div>
          </>}
          <button type="submit" className="w-fit rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary100">Save settings</button>
        </form>
        <dl className="mt-8 grid gap-5 border-t border-gray-200 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Full name</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.displayName || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.email || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Username</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.username || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Phone number</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.countryCode} {user.phoneNumber || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Account type</dt>
            <dd className="mt-1 font-medium capitalize text-gray-900">{user.role || "customer"}</dd>
          </div>
          {(user.role === "vendor" || user.role === "blackmarket") && (
            <>
              <div>
                <dt className="text-sm text-gray-500">Shop name</dt>
                <dd className="mt-1 font-medium text-gray-900">{user.shopName || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Vendor approval</dt>
                <dd className="mt-1 font-medium text-gray-900">{user.isApproved ? "Approved" : "Pending approval"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-500">Shop address</dt>
                <dd className="mt-1 font-medium text-gray-900">{user.shopAddress || "Not provided"}</dd>
              </div>
            </>
          )}
          {user.role === "customer" && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">Delivery address</dt>
              <dd className="mt-1 font-medium text-gray-900">{user.deliveryAddress || "Not provided"}</dd>
            </div>
          )}
        </dl>

        <button
          onClick={signOutHandler}
          className="mt-8 rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Log out
        </button>
        <button
          onClick={deleteAccountHandler}
          className="ml-3 mt-8 rounded-md border border-red-700 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete account
        </button>
      </section>
    </main>
  );
};

export default Account;