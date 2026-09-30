"use client";

import React, { useState } from "react";
import { Download, Printer } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

export default function InvoicePreview() {
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Website redesign",
      hours: 60,
      rate: 15,
    },
    {
      id: "2",
      description: "Newsletter template design",
      hours: 20,
      rate: 12,
    },
  ]);

  const discountPercent = 5;

  // Calculate Subtotal and Total
  const subtotal = items.reduce(
    (acc, item) => acc + item.hours * item.rate,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  // Format number as "1083,00" or similar as shown in design
  const formatCurrency = (val: number) => {
    return val.toFixed(2).replace(".", ",") + " USD";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-8 px-4 sm:px-6 flex justify-center items-start text-slate-800 font-sans">
      {/* Print Specific Styling */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-[850px] bg-white rounded-2xl shadow-xl p-8 sm:p-12 print-shadow-none">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-gray-100 no-print mb-8">
          {/* <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Preview
          </h1> */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Card Container */}
        <div className="space-y-10">
          {/* Gray Header Box */}
          <div className="bg-[#F8F9FA] rounded-xl p-8 flex flex-col md:flex-row justify-between gap-8">
            {/* Left Side: Logo & Recipient */}
            <div className="space-y-6">
              {/* Logo */}
              <div className="w-12 h-12 bg-[#0084FF] rounded-xl flex items-center justify-center text-white font-black text-2xl">
                J
              </div>

              {/* Recipient Details */}
              <div className="space-y-1 text-xs text-gray-500">
                <p className="font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  RECIPIENT
                </p>
                <p className="font-semibold text-gray-700">JOHN SMITH</p>
                <p>4304 Liberty Avenue</p>
                <p>92680 Tustin, CA</p>
                <p>VAT no.: 12345678</p>

                <div className="pt-2 space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#0084FF]">@</span> company.mail@gmail.com
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#0084FF]">m</span> +386 714 505 8385
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Contact & Invoice Metadata */}
            <div className="flex flex-col justify-between items-start md:items-end text-right">
              {/* Sender Contact */}
              <div className="text-xs text-gray-500 space-y-0.5 text-left md:text-right">
                <p className="flex items-center justify-end gap-1.5">
                  <span className="text-[#0084FF]">@</span> your.mail@gmail.com
                </p>
                <p className="flex items-center justify-end gap-1.5">
                  <span className="text-[#0084FF]">m</span> +386 989 271 3115
                </p>
              </div>

              {/* Invoice Title & Dates */}
              <div className="mt-8 md:mt-0 text-left md:text-right">
                <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">
                  Invoice
                </h2>
                <div className="mt-3 text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-gray-400 uppercase tracking-wider block">
                      INVOICE NO.
                    </span>
                    <span className="text-gray-600 font-medium">001/2021</span>
                  </div>
                  <div className="pt-1">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider block">
                      INVOICE DATE
                    </span>
                    <span className="text-gray-600 font-medium">
                      January 1, 2021
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Details */}
          <div className="pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 text-left">TASK DESCRIPTION</th>
                  <th className="pb-3 text-center">HOURS</th>
                  <th className="pb-3 text-center">RATE</th>
                  <th className="pb-3 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-4 text-center">{item.hours}</td>
                    <td className="py-4 text-center">{item.rate} USD</td>
                    <td className="py-4 text-right font-medium">
                      {formatCurrency(item.hours * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400 font-semibold uppercase tracking-wider">
                <span>SUBTOTAL</span>
                <span className="text-gray-700 font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 font-semibold uppercase tracking-wider">
                <span>DISCOUNT {discountPercent}%</span>
                <span className="text-gray-700 font-medium">
                  {formatCurrency(discountAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 text-sm">
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  TOTAL
                </span>
                <span className="text-2xl font-extrabold text-[#0084FF]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details Note */}
          <div className="text-center text-[11px] text-gray-400 pt-6">
            <p>
              Transfer the amount to the business account below. Please include
              invoice number on your check.
            </p>
            <p className="mt-2 font-medium text-gray-600">
              BANK: <span className="font-semibold text-slate-800">FTSBUS33</span>
              <span className="mx-2 text-[#0084FF]">•</span>
              IBAN:{" "}
              <span className="font-semibold text-slate-800">
                GB82-1111-2222-3333
              </span>
            </p>
          </div>

          {/* Notes & Signature Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <p className="font-semibold uppercase tracking-wider text-gray-400">
              NOTES
            </p>
            <p className="leading-relaxed">
              All amounts are in dollars. Please make the payment within 15 days
              from the issue of date of this invoice. Tax is not charged on the
              basis of paragraph 1 of Article 94 of the Value Added Tax Act (I
              am not liable for VAT).
            </p>
            <div className="pt-2">
              <p>Thank you for you confidence in my work.</p>
              <p className="mt-1 font-medium text-gray-500">Signature</p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-[10px] text-gray-400 gap-4">
            <div>
              <p className="font-semibold text-gray-500">YOUR COMPANY</p>
              <p>1331 Hart Ridge Road, 48456 Gaines, MI</p>
            </div>
            <div className="space-y-0.5">
              <p className="flex items-center gap-1">
                <span className="text-[#0084FF]">@</span> your.mail@gmail.com
              </p>
              <p className="flex items-center gap-1">
                <span className="text-[#0084FF]">m</span> +386 989 271 3115
              </p>
            </div>
            <div className="text-right">
              <p>The company is registered in the</p>
              <p>business register under no. 87650000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}