import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { approveVendor, getPendingVendors, rejectVendor } from "../Store/thunk";

const AdminVendors = () => {
  const dispatch = useAppDispatch();
  const { pendingVendors, pendingStatus, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.role === "vendor") {
      dispatch(getPendingVendors());
    }
  }, [dispatch, user]);

  const handleApprove = async (vendorId) => {
    await dispatch(approveVendor(vendorId));
    dispatch(getPendingVendors());
  };

  const handleReject = async (vendorId) => {
    const reason = window.prompt("Why is this vendor being rejected?", "Verification documents were not accepted");
    if (reason === null) return;
    await dispatch(rejectVendor({ vendorId, reason }));
    dispatch(getPendingVendors());
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Access required</h1>
          <p className="text-gray-600">Please sign in to view vendor approvals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-md bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vendor approvals</h1>
          <p className="mt-2 text-gray-600">Review new vendor applications and approve them when ready.</p>
        </div>

        {pendingStatus === "loading" ? (
          <div className="py-10 text-center text-gray-500">Loading pending vendors...</div>
        ) : pendingVendors.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
            No pending vendors at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingVendors.map((vendor) => (
              <div key={vendor.id || vendor._id} className="flex flex-col gap-4 rounded-md border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{vendor.shopName || vendor.businessName || "Unnamed shop"}</p>
                  <p className="text-sm text-gray-600">{vendor.fullName}</p>
                  <p className="text-sm text-gray-600">{vendor.email}</p>
                  <p className="text-sm text-gray-600">{vendor.phoneNumber || "No phone number"}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(vendor.id || vendor._id)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary100"
                  >
                    Approve vendor
                  </button>
                  <button
                    onClick={() => handleReject(vendor.id || vendor._id)}
                    className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject vendor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
