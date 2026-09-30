"use client";

import React, { useState } from "react";
import { Camera, Calendar, MapPin, Plus, Trash2 } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  rate: number;
  qty: number;
}

export default function CreateInvoice() {
  const [invoiceId, setInvoiceId] = useState("#876370");
  const [date, setDate] = useState("2021-12-01");
  const [name, setName] = useState("Alison G.");
  const [email, setEmail] = useState("Example@gmail.com");
  const [address, setAddress] = useState("Street");

  const [products, setProducts] = useState<ProductItem[]>([
    { id: "1", name: "ipod 2021", rate: 1000, qty: 10 },
    { id: "2", name: "Apple Macbook", rate: 1500, qty: 10 },
    { id: "3", name: "i phone 12", rate: 885, qty: 10 },
  ]);

  // Remove product handler
  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((item) => item.id !== id));
  };

  // Add new product handler
  const handleAddProduct = () => {
    const newItem: ProductItem = {
      id: Date.now().toString(),
      name: "New Item",
      rate: 100,
      qty: 1,
    };
    setProducts([...products, newItem]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-3xl p-8 shadow-sm border border-slate-100 font-sans">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#111827] mb-6">
          Create New Invoice
        </h1>

        {/* Profile / Camera Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
            <Camera className="w-7 h-7 text-slate-600" />
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-5">
          {/* Invoice ID & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Invoice Id
              </label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full bg-[#F8F9FB] border-none rounded-xl px-4 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F8F9FB] border-none rounded-xl pl-4 pr-10 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Calendar className="w-4 h-4 text-indigo-500 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8F9FB] border-none rounded-xl px-4 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Email & Address Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F9FB] border-none rounded-xl px-4 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#F8F9FB] border-none rounded-xl pl-4 pr-10 py-3 text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <MapPin className="w-4 h-4 text-indigo-500 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Description Header & Add Button */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Product Description
              </h2>
              <button
                type="button"
                onClick={handleAddProduct}
                className="w-7 h-7 bg-[#5865F2] hover:bg-indigo-600 transition-colors text-white rounded-lg flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Product Table Headers */}
            <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 mb-3 px-1">
              <div className="col-span-4 flex items-center gap-1">
                Product Name <span className="text-[10px]">▼</span>
              </div>
              <div className="col-span-3 flex items-center gap-1">
                Rate <span className="text-[10px]">▼</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                QTY <span className="text-[10px]">▼</span>
              </div>
              <div className="col-span-3 text-right flex items-center justify-end gap-1 pr-6">
                Amount <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-3">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center text-xs py-1 px-1"
                >
                  <div className="col-span-4 font-medium text-sky-600 truncate">
                    {item.name}
                  </div>
                  <div className="col-span-3 text-slate-700 font-medium">
                    ${item.rate}
                  </div>
                  <div className="col-span-2 text-slate-700 font-medium">
                    {item.qty} Pcs
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-3">
                    <span className="font-semibold text-emerald-500">
                      ${(item.rate * item.qty).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(item.id)}
                      className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <button
              type="button"
              className="w-full py-3 px-4 border border-slate-200 text-indigo-500 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Send Invoice
            </button>
            <button
              type="button"
              className="w-full py-3 px-4 bg-[#5865F2] hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
