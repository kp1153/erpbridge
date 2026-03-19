"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setStatus("Uploading...");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setStatus(data.message || "Done");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Data Upload</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-xl">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition">
          <span className="text-4xl mb-2">📁</span>
          <span className="text-gray-400">{file ? file.name : "Drop file or click"}</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <button onClick={handleUpload} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
          Upload
        </button>
        {status && <p className="mt-3 text-gray-400 text-sm">{status}</p>}
      </div>
    </div>
  );
}