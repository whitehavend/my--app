import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { cancelOrder, confirmOrderArrived, getUserOrders, updateOrderDeliveryLocation } from "../Store/thunk";
import { formatCurrency } from "../utils/currency";
import DeliveryLocationPicker from "../components/DeliveryLocationPicker";

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, status, error } = useAppSelector((state) => state.orders);
  const [editingLocationOrderId, setEditingLocationOrderId] = useState("");
  const [deliveryLocationDraft, setDeliveryLocationDraft] = useState(null);
  const [deliveryAddressDraft, setDeliveryAddressDraft] = useState("");
  const [locationError, setLocationError] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  const isValidKenyanPhoneNumber = (value) => {
    const normalizedValue = String(value || "").replace(/\s+/g, "");
    return /^(?:\+?2547\d{8}|07\d{8}|7\d{8})$/.test(normalizedValue);
  };

  const promptForPhoneNumber = (message) => {
    while (true) {
      const phoneNumber = window.prompt(message);
      if (phoneNumber === null) {
        continue;
      }

      const trimmedPhoneNumber = phoneNumber.trim();
      if (!trimmedPhoneNumber || !isValidKenyanPhoneNumber(trimmedPhoneNumber)) {
        window.alert("Please enter a valid Kenyan phone number in the format 07XXXXXXXX or +2547XXXXXXXX.");
        continue;
      }

      return trimmedPhoneNumber;
    }
  };

  const handleCancel = (orderId) => {
    dispatch(cancelOrder(orderId));
  };

  const handleConfirmArrived = async (order) => {
    const phoneNumber = promptForPhoneNumber("Enter the Kenyan M-Pesa phone number for this payment (07XXXXXXXX):");
    const result = await dispatch(confirmOrderArrived({ orderId: order._id || order.id, amount: order.totalAmount, phoneNumber }));
    if (confirmOrderArrived.fulfilled.match(result) && result.payload?.paymentPending) {
      window.alert("An M-Pesa payment prompt has been sent. Complete it to confirm delivery.");
    }
  };

  const startEditingLocation = (order) => {
    const address = order.shippingAddress || {};
    const hasPin = address.latitude !== undefined && address.latitude !== null
      && address.longitude !== undefined && address.longitude !== null
      && Number.isFinite(Number(address.latitude)) && Number.isFinite(Number(address.longitude));
    setEditingLocationOrderId(String(order._id || order.id));
    setDeliveryLocationDraft(hasPin ? { latitude: Number(address.latitude), longitude: Number(address.longitude) } : null);
    setDeliveryAddressDraft(address.address || "");
    setLocationError("");
  };

  const selectDeliveryLocation = (point) => {
    const latitude = Number(point.latitude ?? point.lat);
    const longitude = Number(point.longitude ?? point.lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    setDeliveryLocationDraft({ latitude, longitude });
    setLocationError("");
  };

  const saveDeliveryLocation = async (orderId) => {
    if (!deliveryLocationDraft) {
      setLocationError("Choose the delivery point on the map before saving.");
      return;
    }
    setSavingLocation(true);
    setLocationError("");
    const result = await dispatch(updateOrderDeliveryLocation({
      orderId,
      ...deliveryLocationDraft,
      address: deliveryAddressDraft.trim(),
    }));
    if (updateOrderDeliveryLocation.fulfilled.match(result)) {
      setEditingLocationOrderId("");
    } else {
      setLocationError(result.payload || "Unable to update delivery location.");
    }
    setSavingLocation(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const refreshOrders = () => dispatch(getUserOrders());
    refreshOrders();
    const refreshTimer = setInterval(refreshOrders, 5000);
    return () => clearInterval(refreshTimer);
  }, [dispatch, navigate, user]);

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen text-gray-900">
      <div className="flex h-14 w-full items-center justify-center bg-primary px-4 text-center text-white">
        <span className="text-lg font-black uppercase tracking-[0.22em]">Nova Unicorn</span>
      </div>

      <div className="w-full lg:w-[80%] 2xl:w-[75%] py-8 px-4 lg:px-0">
        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

        {status === "loading" && !orders.length && <p>Loading your orders...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!orders.length && status !== "loading" && (
          <div className="bg-white rounded-md shadow-sm p-6 text-gray-800">
            You have no orders yet.
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id || order.id} className="bg-white rounded-md shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3 mb-3">
                <div>
                  <p className="text-xs uppercase text-gray-700">Order ID</p>
                  <h2 className="font-semibold">{order._id || order.id}</h2>
                </div>
                {order.paymentStatus === "pending" && <p className="mt-2 text-xs font-medium text-amber-700">M-Pesa payment is awaiting confirmation on your phone.</p>}
                {order.paymentStatus === "insufficient_funds" && <p className="mt-2 text-xs font-medium text-red-700">Payment was not completed. Top up your M-Pesa account and try again.</p>}
                <div>
                  <p className="text-xs uppercase text-gray-700">Status</p>
                  <h2 className={`font-semibold ${["delivering", "picked_up", "delivered"].includes(order.status) ? "text-green-600" : ""}`}>{order.status === "delivering" ? "Your product is being delivered" : order.status === "picked_up" ? "Picked up and on the way" : order.status}</h2>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-700">Total</p>
                  <h2 className="font-semibold">{formatCurrency(order.totalAmount, order.currency || order.items?.[0]?.currency)}</h2>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={`${order._id || order.id}-${item._id || item.id}`} className="flex justify-between text-sm text-gray-900">
                    <span>{item.title} x {item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity, item.currency || order.currency)}</span>
                  </div>
                ))}
              </div>
              {order.status === "pending" && (
                <div className="mt-4 border-t pt-4">
                  {editingLocationOrderId === String(order._id || order.id) ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Delivery address or building
                        <input value={deliveryAddressDraft} onChange={(event) => setDeliveryAddressDraft(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Building name, entrance, or landmark" />
                      </label>
                      <p className="mt-2 text-xs text-gray-600">Click the map or drag the marker to the exact drop-off point.</p>
                      <div className="mt-2"><DeliveryLocationPicker value={deliveryLocationDraft} onChange={selectDeliveryLocation} /></div>
                      {deliveryLocationDraft && <p className="mt-2 text-xs text-gray-600">Pin: {deliveryLocationDraft.latitude.toFixed(6)}, {deliveryLocationDraft.longitude.toFixed(6)}</p>}
                      {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => saveDeliveryLocation(order._id || order.id)} disabled={savingLocation} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{savingLocation ? "Saving pin..." : "Save delivery pin"}</button>
                        <button type="button" onClick={() => { setEditingLocationOrderId(""); setLocationError(""); }} disabled={savingLocation} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => startEditingLocation(order)} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary">Adjust delivery pin</button>
                  )}
                </div>
              )}
              {order.status === "pending" && (
                <button type="button" onClick={() => handleCancel(order._id || order.id)} className="mt-4 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  Cancel order
                </button>
              )}
              {["delivering", "picked_up"].includes(order.status) && order.paymentStatus !== "paid" && (
                <button type="button" onClick={() => handleConfirmArrived(order)} disabled={order.paymentStatus === "pending"} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary100 disabled:cursor-not-allowed disabled:opacity-60">
                  {order.paymentStatus === "pending" ? "Payment prompt sent" : "Pay to confirm delivery"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
