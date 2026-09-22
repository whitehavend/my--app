import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { cancelOrder, confirmOrderArrived, getUserOrders } from "../Store/thunk";
import { formatCurrency } from "../utils/currency";

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, status, error } = useAppSelector((state) => state.orders);

  const handleCancel = (orderId) => {
    dispatch(cancelOrder(orderId));
  };

  const handleConfirmArrived = async (order) => {
    const result = await dispatch(confirmOrderArrived({ orderId: order._id || order.id, amount: order.totalAmount }));
    if (confirmOrderArrived.fulfilled.match(result) && result.payload?.paymentPending) {
      window.alert("An M-Pesa payment prompt has been sent to your registered phone. Complete it to confirm delivery.");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    dispatch(getUserOrders());
  }, [dispatch, navigate, user]);

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <div className="flex h-14 w-full items-center justify-center bg-primary px-4 text-center text-white">
        <span className="text-lg font-black uppercase tracking-[0.22em]">Nova Unicorn</span>
      </div>

      <div className="w-full lg:w-[80%] 2xl:w-[75%] py-8 px-4 lg:px-0">
        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

        {status === "loading" && <p>Loading your orders...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!orders.length && status !== "loading" && (
          <div className="bg-white rounded-md shadow-sm p-6 text-gray-600">
            You have no orders yet.
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id || order.id} className="bg-white rounded-md shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3 mb-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">Order ID</p>
                  <h2 className="font-semibold">{order._id || order.id}</h2>
                </div>
                {order.paymentStatus === "pending" && <p className="mt-2 text-xs font-medium text-amber-700">M-Pesa payment is awaiting confirmation on your phone.</p>}
                {order.paymentStatus === "insufficient_funds" && <p className="mt-2 text-xs font-medium text-red-700">Payment was not completed. Top up your M-Pesa account and try again.</p>}
                <div>
                  <p className="text-xs uppercase text-gray-500">Status</p>
                  <h2 className={`font-semibold ${["delivering", "picked_up", "delivered"].includes(order.status) ? "text-green-600" : ""}`}>{order.status === "delivering" ? "Your product is being delivered" : order.status === "picked_up" ? "Picked up and on the way" : order.status}</h2>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Total</p>
                  <h2 className="font-semibold">{formatCurrency(order.totalAmount, order.currency || order.items?.[0]?.currency)}</h2>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={`${order._id || order.id}-${item._id || item.id}`} className="flex justify-between text-sm text-gray-700">
                    <span>{item.title} x {item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity, item.currency || order.currency)}</span>
                  </div>
                ))}
              </div>
              {order.status === "pending" && (
                <button type="button" onClick={() => handleCancel(order._id || order.id)} className="mt-4 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  Cancel order
                </button>
              )}
              {order.status === "picked_up" && (
                <button type="button" onClick={() => handleConfirmArrived(order)} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary100">
                  {order.paymentStatus === "pending" ? "Payment prompt sent" : "Confirm delivery and pay"}
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
