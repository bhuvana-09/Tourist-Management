import { backendApi as api } from "../api/axiosInstance";

/**
 * Triggers the Razorpay checkout overlay in sandbox mode and handles backend verification.
 * 
 * @param {string} bookingId - The target booking ID
 * @param {object} user - The passenger/user profile
 * @param {function} onCompleted - Callback function executed on successful signature verification
 * @param {function} onFailure - Callback function executed on payment closure or verification error
 */
export const triggerRazorpayCheckout = async (bookingId, user, onCompleted, onFailure) => {
  try {
    // 1. Create Razorpay order via Express backend
    const orderData = await api.post("/payments/create-order", { bookingId });
    const { orderId, amount, currency } = orderData;

    // 2. Configure Razorpay checkout options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummykey123",
      amount: amount,
      currency: currency,
      name: "Tourist Management Portal",
      description: "Package Booking Checkout",
      order_id: orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || ""
      },
      handler: async function (response) {
        try {
          // 3. Send successful checkout keys to /verify endpoint
          const verifyRes = await api.post("/payments/verify", {
            bookingId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          onCompleted(verifyRes);
        } catch (err) {
          console.error("Signature verification failed:", err);
          onFailure(err.response?.data?.message || "Payment signature verification failed");
        }
      },
      modal: {
        ondismiss: function () {
          onFailure("Payment window closed. You can complete this payment later under 'My Bookings'.");
        }
      },
      theme: {
        color: "#1d4ed8" // Brand matching blue
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      onFailure("Razorpay SDK failed to load. Please refresh the page and try again.");
    }
  } catch (err) {
    console.error("Payment initialization failed:", err);
    onFailure(err.response?.data?.message || "Failed to initialize payment gateway order");
  }
};
