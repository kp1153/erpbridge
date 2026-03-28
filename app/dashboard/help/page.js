"use client";
import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "ERPBridge Agent Download करें",
    icon: "⬇️",
    content: [
      {
        heading: "Agent क्या है?",
        text: "Tally Agent एक छोटा software है जो आपके computer पर background में चलता है और Tally का data automatically ERPBridge पर भेजता रहता है — हर 15 मिनट में।",
      },
      {
        heading: "Download कहाँ से करें?",
        text: "ERPBridge की website पर जाएं → 'Tally Agent Download करें' button दबाएं → .exe file download होगी।",
      },
      {
        heading: "Install कैसे करें?",
        text: "Download हुई .exe file पर double-click करें → Install होगा → automatically start हो जाएगा।",
      },
    ],
  },
  {
    id: 2,
    title: "Tally में XML Server Enable करें",
    icon: "⚙️",
    content: [
      {
        heading: "यह क्यों जरूरी है?",
        text: "Tally का data Agent को मिले इसके लिए Tally में एक server enable करना होता है। यह एक बार की setting है।",
      },
      {
        heading: "Step 1",
        text: "Tally Prime खोलें → ऊपर menu में 'F1: Help' दबाएं → 'Settings' पर जाएं → 'CoNnectivity' पर click करें।",
      },
      {
        heading: "Step 2",
        text: "'Client/Server configuration' पर Enter दबाएं → 'TallyPrime acts as' में 'Server' select करें → Y दबाकर save करें।",
      },
      {
        heading: "Step 3",
        text: "Tally बंद करें और दोबारा खोलें — setting apply होगी।",
      },
      {
        heading: "Port",
        text: "Default port 9000 रहने दें — कुछ बदलने की जरूरत नहीं।",
      },
    ],
  },
  {
    id: 3,
    title: "Sync Token Copy करें",
    icon: "🔑",
    content: [
      {
        heading: "Token क्या है?",
        text: "Token एक unique code है जो Agent को बताता है कि data किसके account में जाना है। यह आपके account से जुड़ा है।",
      },
      {
        heading: "Token कहाँ मिलेगा?",
        text: "ERPBridge dashboard खोलें → बायीं तरफ 'Settings' पर click करें → 'Sync Token' section में आपका token दिखेगा।",
      },
      {
        heading: "Token Copy करें",
        text: "Token के सामने 'Copy' button दबाएं → token clipboard में copy हो जाएगा।",
      },
    ],
  },
  {
    id: 4,
    title: "Agent में Token Paste करें",
    icon: "📋",
    content: [
      {
        heading: "Agent कहाँ दिखेगा?",
        text: "Taskbar के right side में — जहाँ clock है वहाँ — एक छोटा icon दिखेगा। उस पर click करें।",
      },
      {
        heading: "Settings खोलें",
        text: "Icon पर click करने पर menu खुलेगा → 'Settings' पर click करें → एक छोटी window खुलेगी।",
      },
      {
        heading: "Token Paste करें",
        text: "'Sync Token' वाले box में Ctrl+V दबाएं → token paste हो जाएगा → 'Save' button दबाएं।",
      },
      {
        heading: "Tally Port",
        text: "Tally Port में 9000 रहने दें — जब तक आपने Tally में port नहीं बदला।",
      },
    ],
  },
  {
    id: 5,
    title: "पहली बार Sync करें",
    icon: "🔄",
    content: [
      {
        heading: "Tally चालू रखें",
        text: "Sync करते समय Tally Prime चालू होना जरूरी है — और उसमें कोई company खुली होनी चाहिए।",
      },
      {
        heading: "Sync Now दबाएं",
        text: "System tray में Agent icon पर click करें → 'Sync Now' दबाएं → कुछ seconds में sync हो जाएगा।",
      },
      {
        heading: "Success message",
        text: "'Sync complete. X records inserted.' — यह message दिखे तो data ERPBridge पर पहुँच गया।",
      },
      {
        heading: "Auto Sync",
        text: "अब हर 15 मिनट में automatically sync होता रहेगा — आपको कुछ नहीं करना।",
      },
    ],
  },
  {
    id: 6,
    title: "Dashboard पर Reports देखें",
    icon: "📊",
    content: [
      {
        heading: "Login करें",
        text: "erpbridge.vercel.app खोलें → Google account से login करें।",
      },
      {
        heading: "Sales Report",
        text: "Dashboard → Sales → party-wise और date-wise sales दिखेगी।",
      },
      {
        heading: "Outstanding",
        text: "Dashboard → Outstanding → किस party का कितना पैसा बाकी है — aging के साथ।",
      },
      {
        heading: "Purchase, Inventory, P&L",
        text: "सभी reports left sidebar में मिलेंगी।",
      },
    ],
  },
];

const faqs = [
  {
    q: "Sync हो रहा है लेकिन data नहीं दिख रहा?",
    a: "Dashboard refresh करें। अगर फिर भी नहीं दिखा तो Settings → Clear All Data → दोबारा Sync Now दबाएं।",
  },
  {
    q: "'No data found in Tally' आ रहा है?",
    a: "Tally में XML Server enable है या नहीं check करें (Step 2 देखें)। Tally बंद हो तो चालू करें।",
  },
  {
    q: "'Invalid token' आ रहा है?",
    a: "Dashboard → Settings से token दोबारा copy करें और Agent में paste करें।",
  },
  {
    q: "'Connection refused' error आ रही है?",
    a: "Tally चालू नहीं है — Tally Prime खोलें और कोई company open करें।",
  },
  {
    q: "Agent system tray में नहीं दिख रहा?",
    a: "Start menu में 'ERPBridge Tally Agent' search करें और खोलें।",
  },
  {
    q: "पुराना data delete करना है?",
    a: "Dashboard → Settings → Clear All Data → Confirm करें। फिर Sync Now दबाएं।",
  },
];

export default function HelpPage() {
  const [activeStep, setActiveStep] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-2">
            📖 Setup Guide
          </h1>
          <p className="text-gray-400 text-sm">
            Tally Agent install करने से लेकर dashboard पर reports देखने तक — step by step।
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{step.icon}</span>
                  <div>
                    <span className="text-xs text-yellow-500 font-bold tracking-widest uppercase">
                      Step {step.id}
                    </span>
                    <div className="font-semibold text-white text-sm mt-0.5">{step.title}</div>
                  </div>
                </div>
                <span className="text-gray-500 text-lg">{activeStep === step.id ? "▲" : "▼"}</span>
              </button>

              {activeStep === step.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                  {step.content.map((item, i) => (
                    <div key={i}>
                      <div className="text-yellow-400 text-xs font-bold mb-1">{item.heading}</div>
                      <div className="text-gray-300 text-sm leading-relaxed">{item.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">❓ अक्सर पूछे जाने वाले सवाल</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800 transition"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <span className="text-gray-500 text-lg ml-4 flex-shrink-0">{activeFaq === i ? "▲" : "▼"}</span>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4 border-t border-gray-800 pt-3">
                    <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 text-center">
          <p className="text-yellow-400 font-bold mb-1">अभी भी problem है?</p>
          <p className="text-gray-400 text-sm mb-3">WhatsApp पर message करें — तुरंत help मिलेगी।</p>
          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-500 text-gray-900 font-bold px-6 py-2 rounded-xl hover:bg-yellow-400 transition text-sm"
          >
            💬 WhatsApp करें
          </a>
        </div>

      </div>
    </div>
  );
}