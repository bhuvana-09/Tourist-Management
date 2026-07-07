import React, { useState } from "react";

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
          >
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50/50 transition-colors focus:outline-none"
            >
              <span className="font-bold text-slate-800 text-sm sm:text-base pr-4">
                {item.question}
              </span>
              <span className={`text-slate-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[500px] border-t border-slate-50" : "max-h-0"
              }`}
            >
              <div className="p-6 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
