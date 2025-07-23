import React, { useState, useRef } from "react";
import SpeechToText from "../components/SpeechToText";

const SpeechToTextDemo = () => {
  const [userSpeechKey, setUserSpeechKey] = useState("");
  const [userSpeechRegion, setUserSpeechRegion] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const speechRef = useRef(null);

  // Get credentials from UI or environment variables (Vite style)
  const envSpeechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const envSpeechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;
  const speechKey = userSpeechKey || envSpeechKey;
  const speechRegion = userSpeechRegion || envSpeechRegion;

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 0, border: "none", borderRadius: 18, background: "#f7fafd", boxShadow: "0 4px 24px 0 rgba(60,60,120,0.10)" }}>
      <div style={{ padding: 32, borderRadius: 18, background: "#fff", border: "1px solid #e3e8f0" }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 8, color: '#2d3a4a', letterSpacing: 0.5 }}>Speech to Text Demo</h2>
        {/* Credentials input fields */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: '#2d3a4a' }}>
            Azure Speech Key:
            <input
              type="text"
              value={userSpeechKey}
              onChange={e => setUserSpeechKey(e.target.value)}
              placeholder="Enter Azure Speech Key or leave blank for .env"
              style={{ width: "100%", padding: 10, marginTop: 4, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 15 }}
              autoComplete="off"
            />
          </label>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: '#2d3a4a' }}>
            Azure Speech Region:
            <input
              type="text"
              value={userSpeechRegion}
              onChange={e => setUserSpeechRegion(e.target.value)}
              placeholder="Enter Azure Speech Region or leave blank for .env"
              style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 15 }}
              autoComplete="off"
            />
          </label>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            <span>Credentials are not stored. Leave blank to use .env values.</span>
          </div>
        </div>
        {/* Language Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: '#2d3a4a' }}>
            Language:
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 15 }}
            >
              <option value="auto">Auto Detect (10 languages)</option>
              <option value="en-US">English (US)</option>
              <option value="si-LK">Sinhala (Sri Lanka)</option>
              <option value="ta-IN">Tamil (India)</option>
              <option value="hi-IN">Hindi (India)</option>
              <option value="zh-CN">Chinese (Mandarin)</option>
              <option value="ru-RU">Russian</option>
              <option value="de-DE">German</option>
              <option value="fr-FR">French</option>
              <option value="ja-JP">Japanese</option>
              <option value="ar-SA">Arabic</option>
            </select>
          </label>
        </div>
        <p style={{ color: "#3b4252", marginBottom: 8, textAlign: 'center', fontSize: 16 }}>
          <b>For best results, wait for <span style={{color:'#2563eb'}}>Listening...</span> before speaking. Speak clearly and at a moderate pace.</b>
        </p>
        {/* SpeechToText component */}
        <SpeechToText
          ref={speechRef}
          subscriptionKey={speechKey}
          region={speechRegion}
          language={selectedLanguage}
          onTranscriptReceived={setTranscript}
          showTranscript={true}
        />
        {/* Transcript actions */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => setTranscript("")}
            style={{
              background: "#f1c40f",
              color: "#222",
              border: "none",
              borderRadius: 24,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 500,
              cursor: transcript ? "pointer" : "not-allowed",
              opacity: transcript ? 1 : 0.6
            }}
            disabled={!transcript}
          >
            Clear Transcript
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 500,
              cursor: transcript ? "pointer" : "not-allowed",
              opacity: transcript ? 1 : 0.6
            }}
            disabled={!transcript}
          >
            Copy Transcript
          </button>
        </div>
        {/* Error display */}
        {error && (
          <div style={{ color: "#e74c3c", marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 32, fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 1.7 }}>
          <div>• Try Sri Lankan place names, botanical gardens, and tourist attractions for best results.</div>
          <div>• Have credentials for Azure accounts.</div>
          <div>• The phrase list is optimized for Sri Lankan travel demo.</div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextDemo;