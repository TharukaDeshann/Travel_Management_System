import React, { useState, useRef } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  PhraseListGrammar,
  AutoDetectSourceLanguageConfig
} from "microsoft-cognitiveservices-speech-sdk";

// List of Sri Lankan place names (no duplicates)
const sriLankanPlaces = [
  // Major cities
  "Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura", "Polonnaruwa", "Nuwara Eliya", "Matara", "Trincomalee",
  "Negombo", "Batticaloa", "Kurunegala", "Ratnapura", "Badulla", "Puttalam", "Hambantota", "Vavuniya", "Mannar",
  "Kilinochchi", "Mullaitivu", "Ampara", "Monaragala", "Kalutara", "Gampaha", "Matale", "Kegalle", "Gampola",
  "Hatton", "Dambulla", "Sigiriya", "Ella", "Arugam Bay", "Mirissa", "Unawatuna", "Bentota", "Hikkaduwa",
  "Tangalle", "Weligama", "Pasikuda", "Nilaveli", "Pinnawala", "Kitulgala", "Udawalawe", "Yala", "Wilpattu",
  "Sinharaja", "Horton Plains", "Knuckles", "Adams Peak", "Pidurangala", "Kalpitiya", "Beruwala", "Chilaw",
  "Ambalangoda", "Ahangama", "Talalla", "Kosgoda", "Induruwa", "Moratuwa", "Panadura", "Wadduwa", "Aluthgama",
  "Balapitiya", "Deniyaya", "Embilipitiya", "Tissamaharama", "Kataragama", "Sooriyawewa", "Ranna", "Ambalantota",
  "Hungama", "Walasmulla", "Weeraketiya", "Katuwana", "Angunakolapelessa", "Middeniya", "Kalametiya",
  // Botanical gardens
  "Peradeniya Botanical Garden", "Hakgala Botanical Garden", "Henarathgoda Botanical Garden", "Mirijjawila Botanical Garden", "Seethawaka Wet Zone Botanical Garden",
  // Waterfalls
  "Diyaluma Falls", "Bambarakanda Falls", "Ravana Falls", "Dunhinda Falls", "St. Clair's Falls", "Devon Falls", "Bopath Ella", "Laxapana Falls",
  // Beaches
  "Nilaveli Beach", "Uppuveli Beach", "Mount Lavinia Beach", "Hiriketiya Beach", "Kalpitiya Beach", "Beruwala Beach", "Negombo Beach", "Arugam Bay Beach",
  // Temples and religious sites
  "Temple of the Tooth", "Sri Dalada Maligawa", "Gangaramaya Temple", "Kelaniya Raja Maha Vihara", "Seetha Amman Temple", "Mihintale", "Ruwanwelisaya", "Jaya Sri Maha Bodhi", "Isurumuniya", "Thuparamaya",
  // National parks and reserves
  "Yala National Park", "Wilpattu National Park", "Udawalawe National Park", "Horton Plains National Park", "Sinharaja Forest Reserve", "Bundala National Park", "Kaudulla National Park", "Minneriya National Park",
  // Forts and historical sites
  "Galle Fort", "Sigiriya Rock Fortress", "Dambulla Cave Temple", "Polonnaruwa Vatadage", "Anuradhapura Ruins", "Jaffna Fort", "Dutch Fort Matara",
  // Lakes and rivers
  "Kandy Lake", "Beira Lake", "Gregory Lake", "Parakrama Samudra", "Mahaweli River", "Kelani River",
  // Other tourist attractions
  "Seethawaka", "Seetha Eliya", "Seetha Amman Kovil", "Seetha Kotuwa", "Ramboda Falls", "Nine Arches Bridge", "Little Adam's Peak", "Pidurangala Rock", "Ella Rock", "Demodara Loop", "Haputale", "Lipton's Seat", "Ambewela Farm", "Horton Plains", "World's End", "Pigeon Island", "Kumana National Park", "Madu River", "Madu Ganga", "Kanneliya Forest Reserve", "Hummanaya Blowhole", "Moon Plains", "Victoria Park Nuwara Eliya", "Gregory Park", "Royal Botanical Gardens Peradeniya", "Hakgala Gardens", "Seethawaka Botanical Garden", "Mirijjawila Garden", "Gal Oya National Park", "Wasgamuwa National Park", "Ritigala", "Kaludiya Pokuna", "Yapahuwa", "Aukana Buddha Statue", "Delft Island", "Mannar Island", "Jaffna Library", "Point Pedro", "Nagadeepa Temple", "Nallur Kandaswamy Kovil", "Keerimalai Springs", "Casuarina Beach", "Chundikulam National Park"
];
// Remove duplicates
const uniqueSriLankanPlaces = Array.from(new Set(sriLankanPlaces));

// Language-specific phrase lists for better accuracy
const languagePhraseLists = {
  "en-US": [
    // English phrases
    "I want to go to", "I would like to visit", "Can you help me", "How do I get to",
    "What is the best way to", "I need directions to", "Is it far from", "How long does it take",
    "What time does it open", "How much does it cost", "Can I book", "I need a guide",
    "Where can I find", "What is the weather like", "Is it safe to", "What should I bring"
  ],
  "si-LK": [
    // Sinhala phrases (Romanized)
    "mama yanna oone", "mama balanna oone", "mata udaw karanna puluwan da",
    "kohomada yanna", "kawda hari", "kawda wala", "kawda kalak", "kawda wela",
    "kawda moola", "kawda saha", "kawda karanna", "kawda balanna",
    // Common Sinhala place names
    "Colombo", "Kandy", "Galle", "Anuradhapura", "Polonnaruwa", "Nuwara Eliya",
    "Sigiriya", "Dambulla", "Ella", "Mirissa", "Unawatuna", "Bentota", "Hikkaduwa",
    "Tangalle", "Arugam Bay", "Yala", "Wilpattu", "Sinharaja", "Horton Plains"
  ],
  "ta-IN": [
    // Tamil phrases (Romanized)
    "nān pōka vēṇṭum", "nān pākka vēṇṭum", "enakku udhavi seiyalāmā",
    "eppadi pōka vēṇṭum", "yār irukkirār", "yār vandār", "yār kālām", "yār nēram",
    "yār vilai", "yār sērthu", "yār panna", "yār pākka",
    // Common Tamil place names
    "Jaffna", "Trincomalee", "Batticaloa", "Vavuniya", "Mullaitivu", "Kilinochchi"
  ],
  "hi-IN": [
    // Hindi phrases
    "main jana chahta hun", "main dekhna chahta hun", "kya aap meri madad kar sakte hain",
    "kaise jana hai", "kaun hai", "kaun aaya", "kab kalam", "kab samay",
    "kitna paisa", "kaun sath", "kaun karna", "kaun dekhna",
    // Common Hindi place names
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad"
  ]
};

// Get phrase list for selected language
const getPhraseListForLanguage = (languageCode) => {
  const baseList = uniqueSriLankanPlaces;
  const languageSpecific = languagePhraseLists[languageCode] || [];
  return [...baseList, ...languageSpecific];
};

// List of language codes for auto-detection (10 common tourist languages in Sri Lanka)
const AUTO_LANGUAGES = [
  "en-US", // English
  "si-LK", // Sinhala
  "ta-IN", // Tamil
  "hi-IN", // Hindi
  "zh-CN", // Chinese (Mandarin)
  "ru-RU", // Russian
  "de-DE", // German
  "fr-FR", // French
  "ja-JP", // Japanese
  "ar-SA"  // Arabic
];

const SpeechToTextDemo = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isReady, setIsReady] = useState(false); // New: recognizer ready state
  const [error, setError] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState(""); // New: detected language
  const [selectedLanguage, setSelectedLanguage] = useState("auto"); // New: language selector
  const recognizerRef = useRef(null);

  // UI state for credentials
  const [userSpeechKey, setUserSpeechKey] = useState("");
  const [userSpeechRegion, setUserSpeechRegion] = useState("");

  // Get credentials from UI or environment variables
  const envSpeechKey = import.meta.env.VITE_REACT_APP_AZURE_SPEECH_KEY || import.meta.env.REACT_APP_AZURE_SPEECH_KEY;
  const envSpeechRegion = import.meta.env.VITE_REACT_APP_AZURE_SPEECH_REGION || import.meta.env.REACT_APP_AZURE_SPEECH_REGION;
  const speechKey = userSpeechKey || envSpeechKey;
  const speechRegion = userSpeechRegion || envSpeechRegion;

  console.log('Speech Key:', speechKey, 'Region:', speechRegion);

  const startListening = async () => {
    setError("");
    setTranscript("");
    setIsReady(false);
    setDetectedLanguage("");
    if (!speechKey || !speechRegion) {
      setError("Azure Speech Service credentials are missing.");
      return;
    }

    try {
      const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      
      let recognizer;
      
      if (selectedLanguage === "auto") {
        // Try auto language detection
        try {
          const autoLangConfig = AutoDetectSourceLanguageConfig.fromLanguages(AUTO_LANGUAGES);
          recognizer = new SpeechRecognizer(speechConfig, autoLangConfig, audioConfig);
          console.log("Auto language detection enabled");
        } catch (autoError) {
          console.warn("Auto language detection failed, falling back to English:", autoError);
          speechConfig.speechRecognitionLanguage = "en-US";
          recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        }
      } else {
        // Use selected language
        speechConfig.speechRecognitionLanguage = selectedLanguage;
        recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        console.log(`Using language: ${selectedLanguage}`);
      }

      // Add phrase list for selected language
      const phraseList = PhraseListGrammar.fromRecognizer(recognizer);
      const phrasesToAdd = getPhraseListForLanguage(selectedLanguage);
      phrasesToAdd.forEach(phrase => phraseList.addPhrase(phrase));

      recognizer.recognizing = (s, e) => {
        setTranscript(e.result.text);
      };

      recognizer.recognized = (s, e) => {
        if (e.result.reason === 3) { // RecognizedSpeech
          setTranscript(e.result.text);
          // Try to get detected language
          try {
            if (e.result.properties && e.result.properties.getProperty) {
              const lang = e.result.properties.getProperty("SpeechServiceConnection_AutoDetectResult");
              if (lang) {
                const langObj = JSON.parse(lang);
                setDetectedLanguage(langObj.Language || "");
              }
            }
          } catch (langError) {
            console.warn("Could not detect language:", langError);
          }
        }
      };

      recognizer.canceled = (s, e) => {
        setError("Recognition canceled: " + e.errorDetails);
        setIsListening(false);
        setIsReady(false);
      };

      recognizer.sessionStopped = () => {
        setIsListening(false);
        setIsReady(false);
      };

      recognizer.sessionStarted = () => {
        setIsReady(true);
      };

      recognizerRef.current = recognizer;
      setIsListening(true);
      recognizer.startContinuousRecognitionAsync();
    } catch (err) {
      setError("Error initializing speech recognition: " + err.message);
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        setIsListening(false);
        setIsReady(false);
      });
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 0, border: "none", borderRadius: 18, background: "#f7fafd", boxShadow: "0 4px 24px 0 rgba(60,60,120,0.10)" }}>
      <div style={{ padding: 32, borderRadius: 18, background: "#fff", border: "1px solid #e3e8f0" }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 8, color: '#2d3a4a', letterSpacing: 0.5 }}>Speech to Text </h2>
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
        {detectedLanguage && (
          <div style={{ textAlign: 'center', marginBottom: 8, color: '#2563eb', fontWeight: 500 }}>
            Detected Language: {detectedLanguage}
          </div>
        )}
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              background: isListening ? "#e74c3c" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              padding: "12px 32px",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              marginRight: 8,
              boxShadow: isListening ? '0 2px 8px #e74c3c33' : '0 2px 8px #2563eb33',
              transition: 'background 0.2s, box-shadow 0.2s'
            }}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>
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
          {isListening && !isReady && (
            <span style={{ marginLeft: 8, color: '#888', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, background: '#888', borderRadius: '50%', display: 'inline-block', marginRight: 6, animation: 'pulse 1s infinite' }}></span>
              Initializing...
            </span>
          )}
          {isListening && isReady && (
            <span style={{ marginLeft: 8, color: '#27ae60', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, background: '#27ae60', borderRadius: '50%', display: 'inline-block', marginRight: 6, animation: 'pulse 1s infinite' }}></span>
              Listening...
            </span>
          )}
        </div>
        <div style={{
          minHeight: 80,
          border: "1.5px solid #cbd5e1",
          borderRadius: 10,
          padding: 18,
          background: "#f8fafc",
          fontSize: 19,
          color: "#222",
          marginBottom: 8,
          fontFamily: 'Segoe UI',
          boxShadow: '0 1px 4px 0 #e3e8f0',
          wordBreak: 'break-word',
          lineHeight: 1.5
        }}>
          {transcript || <span style={{ color: "#aaa" }}>Your speech will appear here...</span>}
        </div>
        {error && (
          <div style={{ color: "#e74c3c", marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}
        {/* Add a little CSS for the listening indicator pulse */}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}</style>
        <div style={{ marginTop: 32, fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 1.7 }}>
          <div>• Try Sri Lankan place names, botanical gardens, and tourist attractions for best results.</div>
          <div>• have credentials for  Azure accounts.</div>
          <div>• The phrase list is optimized for Sri Lankan travel demo.</div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextDemo;