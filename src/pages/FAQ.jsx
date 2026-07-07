import React from "react";
import FAQAccordion from "../components/FAQAccordion";

export default function FAQ() {
  const faqItems = [
    {
      question: "How does the booking process work on the portal?",
      answer: "Browsing destinations and tour packages is fully open to the public. To lock in a trip, simply select your desired package, specify travel details, and proceed to checkout. A logged-in account is required to complete the booking form and initiate payment."
    },
    {
      question: "What is your cancellation and refund policy?",
      answer: "Bookings can be cancelled directly from your 'My Bookings' panel if they are in 'pending' or 'confirmed' status. If the booking was already paid, a test-mode refund will be simulated automatically, and your payment status will transition to 'refunded'."
    },
    {
      question: "Is payment security verified in test mode?",
      answer: "Yes. All credit transactions use Razorpay in sandbox test-mode. All signatures are strictly verified on our backend using HMAC-SHA256 checksum validations to prevent payment spoofing or double-firing events."
    },
    {
      question: "How do the AI recommendations and Day Itineraries work?",
      answer: "Our portal features advanced Google Gemini integrations. Registered users receive personalized destination recommendations grounded in their booking history. Anyone can generate comprehensive, day-by-day sightseeing itineraries directly on the Destination details pages."
    },
    {
      question: "Where can I view in-app alerts and notifications?",
      answer: "Important lifecycle events (payment success, cancellations, etc.) trigger immediate alerts. A notification bell is located on the navigation bar for logged-in users, displaying unread counters and quick summary dropdowns."
    }
  ];

  return (
    <div className="page-shell max-w-4xl mx-auto py-12 space-y-8 animate-fade">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Help center
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Find instant answers to common questions regarding booking procedures, payments, cancellations, and AI integrations.
        </p>
      </div>

      <FAQAccordion items={faqItems} />
    </div>
  );
}
