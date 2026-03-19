"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [business, setBusiness] = useState("");
  const [erp, setErp] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Business Name</label>
          <input type="text" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Sharma Hardware Store" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">ERP Software</label>
          <select value={erp} onChange={(e) => setErp(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
            <option value="">Select</option>
            <option value="tally">Tally</option>
            <option value="busy">Busy</option>
            <option value="marg">Marg ERP</option>
            <option value="zoho">Zoho Books</option>
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          Save
        </button>
      </div>
    </div>
  );
}