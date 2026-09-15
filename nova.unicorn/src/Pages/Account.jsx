import { Navigate, Link } from "react-router-dom";
import { useAppSelector } from "../Store/hooks";

const Account = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Full name</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.displayName || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.email || "Not provided"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Account type</dt>
            <dd className="mt-1 font-medium capitalize text-gray-900">{user.role || "customer"}</dd>
          </div>
          {user.role === "vendor" && (
            <>
              <div>
                <dt className="text-sm text-gray-500">Shop name</dt>
                <dd className="mt-1 font-medium text-gray-900">{user.shopName || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Vendor approval</dt>
                <dd className="mt-1 font-medium text-gray-900">{user.isApproved ? "Approved" : "Pending approval"}</dd>
              </div>
            </>
          )}
        </dl>
      </section>
    </main>
  );
};

export default Account;