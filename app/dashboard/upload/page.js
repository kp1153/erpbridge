"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setStatus("Uploading...");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setStatus("");
    setResult(data);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .upload-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
        .upload-sub { font-size: 13px; color: #706e6a; font-weight: 300; margin-bottom: 32px; }
        .upload-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 40px; max-width: 560px; }
        .drop-zone { border: 2px dashed rgba(245,200,66,0.2); border-radius: 8px; padding: 48px 32px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone.active { border-color: rgba(245,200,66,0.6); background: rgba(245,200,66,0.04); }
        .drop-zone:hover { border-color: rgba(245,200,66,0.4); }
        .drop-icon { font-size: 36px; margin-bottom: 12px; font-family: monospace; color: #f5c842; }
        .drop-text { font-size: 15px; color: #f0ede8; margin-bottom: 6px; font-weight: 400; }
        .drop-sub { font-size: 12px; color: #706e6a; font-weight: 300; }
        .file-name { margin-top: 16px; padding: 12px 16px; background: rgba(245,200,66,0.06); border: 1px solid rgba(245,200,66,0.15); border-radius: 6px; font-size: 13px; color: #f5c842; }
        .upload-btn { margin-top: 20px; width: 100%; background: #f5c842; color: #0a0a0f; border: none; padding: 14px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .upload-btn:hover { background: #ffd966; transform: translateY(-1px); }
        .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .result-box { margin-top: 20px; padding: 16px 20px; border-radius: 8px; font-size: 14px; font-weight: 300; }
        .result-box.success { background: rgba(78,203,113,0.08); border: 1px solid rgba(78,203,113,0.2); color: #4ecb71; }
        .result-box.error { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); color: #ff6b6b; }
        .guide-box { margin-top: 32px; background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 28px; max-width: 560px; }
        .guide-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f0ede8; margin-bottom: 16px; }
        .guide-row { font-size: 13px; color: #706e6a; font-weight: 300; margin-bottom: 8px; line-height: 1.6; }
        .guide-row strong { color: #f0ede8; font-weight: 400; }
      `}</style>

      <div className="upload-title">Upload Data</div>
      <div className="upload-sub">Upload your ERP export file to populate reports.</div>

      <div className="upload-box">
        <div
          className={`drop-zone ${dragging ? "active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input").click()}
        >
          <div className="drop-icon">[+]</div>
          <div className="drop-text">Drop file here or click to browse</div>
          <div className="drop-sub">CSV, XLS, XLSX supported</div>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {file && <div className="file-name">Selected: {file.name}</div>}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || status === "Uploading..."}
        >
          {status === "Uploading..." ? "Uploading..." : "Upload File"}
        </button>

        {result && (
          <div className={`result-box ${result.inserted > 0 ? "success" : "error"}`}>
            {result.message}
          </div>
        )}
      </div>

      <div className="guide-box">
        <div className="guide-title">File Format Guide</div>
        <div className="guide-row"><strong>Column: type</strong> - values: sales, purchase, outstanding</div>
        <div className="guide-row"><strong>Column: party</strong> - party or customer name</div>
        <div className="guide-row"><strong>Column: amount</strong> - numeric value only</div>
        <div className="guide-row"><strong>Column: date</strong> - format: YYYY-MM-DD</div>
      </div>
    </div>
  );
}