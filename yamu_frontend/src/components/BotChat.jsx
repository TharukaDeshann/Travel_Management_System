import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import { getDirectLineToken } from '../services/botService';
import { Mic, MicOff } from 'lucide-react';
import useSpeechToText from '../hooks/useSpeechToText';

const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: 'Auto Detect (10 languages)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'si-LK', label: 'Sinhala (Sri Lanka)' },
  { code: 'ta-IN', label: 'Tamil (India)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)' },
  { code: 'ru-RU', label: 'Russian' },
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ar-SA', label: 'Arabic' },
];

const PHRASE_LISTS = {
  'en-US': [
    'Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Nuwara Eliya', 'Yala', 'Mirissa', 'Unawatuna', 'Ella', 'Jaffna',
    'Where is', 'How to get to', 'Best hotels in', 'Things to do in', 'Attractions in', 
    'Recommend places in', 'Best time to visit', 'How far is', 'Tour guide for',
    'beach', 'safari', 'temple', 'hiking', 'whale watching', 'train ride', 'tea plantation',
    'I want to go to', 'Show me', 'Tell me about', 'Plan trip to', 'Visit',
    'What to see', 'Where to stay', 'Good restaurants', 'Cultural sites', 'Historical places',
    'Weather forecast', 'Best season', 'Local food', 'Traditional dance', 'Transport options'
  ],
  'si-LK': [
    'කොළඹ', 'මහනුවර', 'ගාල්ල', 'සීගිරිය', 'නුවරඑළිය', 'යාල', 'මිරිස්ස', 'උණවටුන', 'ඇල්ල', 'යාපනය',
    'කොහෙද', 'කොහෙන්ද', 'හොඳම හෝටල්', 'කරන්න දේවල්', 'ආකර්ශන', 
    'නිර්දේශ කරන්න', 'හොඳම කාලය', 'කොච්චර දුරද', 'මගපෙන්වන්නා',
    'වෙරළ', 'සෆාරි', 'විහාරය', 'ගමන', 'තල්මසුන්', 'රේල්ගතය', 'තේ වතු',
    'මට යන්න ඕන', 'මට පෙන්වන්න', 'මට කියන්න', 'මට දඹුල්ලට යන්න ඕන', 'පැමිණෙන්න',
    'කුමක් දැකිය හැකිද', 'රැඳීමට හොඳම ස්ථාන', 'හොඳ අවන්හල්', 'සංස්කෘතික ස්ථාන', 'ඓතිහාසික ස්ථාන',
    'කාලගුණ පුරෝකථනය', 'හොඳම ඍතුව', 'දේශීය ආහාර', 'සාම්ප්‍රදායික නැටුම්', 'ප්‍රවාහන විකල්ප'
  ],
  'ta-IN': [
    'கொழும்பு', 'கண்டி', 'காலி', 'சிகிரியா', 'நுவரெலியா', 'யாலா', 'மிரிஸ்ஸா', 'உனவத்துனை', 'எல்லை', 'யாழ்ப்பாணம்',
    'எங்கே', 'எப்படி செல்வது', 'சிறந்த ஹோட்டல்கள்', 'செய்ய வேண்டியவை', 'ஈர்ப்புகள்', 
    'பரிந்துரைகள்', 'சிறந்த நேரம்', 'எவ்வளவு தூரம்', 'வழிகாட்டி',
    'கடற்கரை', 'சஃபாரி', 'கோவில்', 'நடைபயணம்', 'திமிங்கலம்', 'ரயில் பயணம்', 'தேயிலைத் தோட்டம்',
    'நான் செல்ல வேண்டும்', 'எனக்கு காட்டு', 'எனக்கு சொல்லுங்கள்', 'பயணத் திட்டம்', 'வருகை',
    'என்ன பார்க்கலாம்', 'தங்க சிறந்த இடங்கள்', 'நல்ல உணவகங்கள்', 'கலாச்சார தளங்கள்', 'வரலாற்று இடங்கள்',
    'வானிலை முன்னறிவிப்பு', 'சிறந்த பருவம்', 'உள்ளூர் உணவு', 'பாரம்பரிய நடனம்', 'போக்குவரத்து வழிகள்'
  ],
  'zh-CN': [
    '科伦坡', '康提', '加勒', '狮子岩', '努沃勒埃利耶', '亚拉', '米瑞莎', '乌纳瓦图纳', '埃拉', '贾夫纳',
    '在哪里', '怎么去', '最好的酒店', '可以做什么', '景点', 
    '推荐', '最佳时间', '多远', '导游','地方在哪里',
    '海滩', '野生动物园', '寺庙', '徒步', '观鲸', '火车旅行', '茶园',
    '我想去', '给我看', '告诉我', '计划旅行', '参观',
    '看什么', '住哪里', '好餐馆', '文化遗址', '历史遗迹',
    '天气预报', '最佳季节', '当地美食', '传统舞蹈', '交通选择'
  ],
  'ru-RU': [
    'Коломбо', 'Канди', 'Галле', 'Сигирия', 'Нувара-Элия', 'Яла', 'Мирисса', 'Унаватуна', 'Элла', 'Джафна',
    'Где находится', 'Как добраться до', 'Лучшие отели в', 'Чем заняться в', 'Достопримечательности', 
    'Рекомендации по', 'Лучшее время для', 'Как далеко', 'Гид по',
    'пляж', 'сафари', 'храм', 'поход', 'наблюдение за китами', 'поездка на поезде', 'чайная плантация',
    'Я хочу поехать в', 'Покажите мне', 'Расскажите о', 'Планирую поездку в', 'Посетить',
    'Что посмотреть', 'Где остановиться', 'Хорошие рестораны', 'Культурные объекты', 'Исторические места',
    'Прогноз погоды', 'Лучший сезон', 'Местная кухня', 'Традиционные танцы', 'Варианты транспорта'
  ],
  'de-DE': [
    'Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Nuwara Eliya', 'Yala', 'Mirissa', 'Unawatuna', 'Ella', 'Jaffna',
    'Wo ist', 'Wie komme ich zu', 'Beste Hotels in', 'Was kann man machen in', 'Sehenswürdigkeiten', 
    'Empfehlungen für', 'Beste Reisezeit', 'Wie weit ist', 'Reiseführer für',
    'Strand', 'Safari', 'Tempel', 'Wandern', 'Walbeobachtung', 'Zugfahrt', 'Teepflanzung',
    'Ich möchte gehen zu', 'Zeig mir', 'Erzähl mir über', 'Reise planen nach', 'Besuchen',
    'Was zu sehen', 'Wo zu bleiben', 'Gute Restaurants', 'Kulturelle Stätten', 'Historische Orte',
    'Wettervorhersage', 'Beste Saison', 'Lokale Küche', 'Traditionelle Tänze', 'Transportoptionen'
  ],
  'fr-FR': [
    'Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Nuwara Eliya', 'Yala', 'Mirissa', 'Unawatuna', 'Ella', 'Jaffna',
    'Où est', 'Comment aller à', 'Meilleurs hôtels à', 'Choses à faire à', 'Attractions', 
    'Recommandations pour', 'Meilleure période pour', 'À quelle distance est', 'Guide pour',
    'plage', 'safari', 'temple', 'randonnée', 'observation des baleines', 'voyage en train', 'plantation de thé',
    'Je veux aller à', 'Montrez-moi', 'Parlez-moi de', 'Planifier un voyage à', 'Visiter',
    'Que voir', 'Où loger', 'Bon restaurants', 'Sites culturels', 'Lieux historiques',
    'Prévisions météo', 'Meilleure saison', 'Cuisine locale', 'Danses traditionnelles', 'Options de transport'
  ],
  'ja-JP': [
    'コロンボ', 'キャンディ', 'ゴール', 'シギリヤ', 'ヌワラエリヤ', 'ヤーラ', 'ミリッサ', 'ウナワトゥナ', 'エッラ', 'ジャフナ',
    'どこですか', 'どうやって行きますか', '最高のホテル', 'できること', '観光スポット', 
    'おすすめ', 'ベストシーズン', 'どのくらい遠いですか', 'ガイド',
    'ビーチ', 'サファリ', '寺院', 'ハイキング', 'ホエールウォッチング', '電車の旅', '茶畑',
    'に行きたい', '見せて', 'について教えて', '旅行の計画', '訪問する',
    '何を見る', 'どこに滞在する', '良いレストラン', '文化遺産', '歴史的な場所',
    '天気予報', 'ベストシーズン', '地元料理', '伝統舞踊', '交通手段'
  ],
  'ar-SA': [
    'كولومبو', 'كاندي', 'جال', 'سيجيريا', 'نوارا إليا', 'يالا', 'ميريسا', 'أوناواتونا', 'إيلا', 'جافنا',
    'أين هو', 'كيف أصل إلى', 'أفضل الفنادق في', 'أشياء يمكن فعلها في', 'معالم الجذب', 
    'توصيات ل', 'أفضل وقت ل', 'كم تبعد', 'دليل ل',
    'شاطئ', 'سفاري', 'معبد', 'تنزه', 'مشاهدة الحيتان', 'رحلة قطار', 'مزرعة شاي',
    'أريد الذهاب إلى', 'أرني', 'أخبرني عن', 'تخطيط رحلة إلى', 'زيارة',
    'ماذا ترى', 'أين تقيم', 'مطاعم جيدة', 'مواقع ثقافية', 'أماكن تاريخية',
    'توقعات الطقس', 'أفضل موسم', 'المأكولات المحلية', 'رقصات تقليدية', 'خيارات النقل'
  ]
};

const BotChat = () => {
  const [directLineClient, setDirectLineClient] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [inputText, setInputText] = useState('');
  const [micReady, setMicReady] = useState(false);
  const inputRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

  const {
    isListening: isSpeechListening,
    transcript,
    startListening: startSpeechListening,
    stopListening: stopSpeechListening,
    isInitialized: isSpeechInitialized
  } = useSpeechToText({
    subscriptionKey: speechKey,
    region: speechRegion,
    language: selectedLanguage === 'auto' ? 'en-US' : selectedLanguage,
    phrases: PHRASE_LISTS[selectedLanguage === 'auto' ? 'en-US' : selectedLanguage],
    onTranscript: (text) => {
      if (text && text.trim() !== inputText.trim()) {
        setInputText(text);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      setError('Could not understand. Please try speaking clearly or type your message.');
      setIsProcessingSpeech(false);
      setMicReady(false);
      clearTimeout(speechTimeoutRef.current);
    },
    onStart: () => {
      setIsProcessingSpeech(true);
      setError(null);
      // Microphone is ready after 300ms (optimized for faster response)
      speechTimeoutRef.current = setTimeout(() => {
        setMicReady(true);
      }, 300);
    },
    onEnd: () => {
      setIsProcessingSpeech(false);
      setMicReady(false);
      clearTimeout(speechTimeoutRef.current);
    }
  });

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    
    if (isSpeechListening) {
      stopSpeechListening();
      setTimeout(() => {
        startSpeechListening(newLanguage === 'auto' ? 'en-US' : newLanguage);
      }, 300);
    }
  };

  const handleSpeechButtonClick = () => {
    if (!isSpeechListening) {
      startSpeechListening();
    } else {
      stopSpeechListening();
    }
  };

  useEffect(() => {
    if (!isSpeechListening && transcript.trim() && inputText === transcript) {
      const timer = setTimeout(() => {
        handleSendMessage();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isSpeechListening, transcript, inputText]);

  useEffect(() => {
    if (!isSpeechListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSpeechListening]);

  const store = useMemo(() =>
    createStore({}, ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
        const { payload: { activity } } = action;
        activity.channelData = {
          ...activity.channelData,
          qna: {
            confidenceScoreThreshold: 0.60
          },
          speechRecognition: isSpeechListening ? {
            language: selectedLanguage,
            phrases: PHRASE_LISTS[selectedLanguage === 'auto' ? 'en-US' : selectedLanguage]
          } : undefined
        };
      }
      return next(action);
    })
  , [isSpeechListening, selectedLanguage]);

  useEffect(() => {
    const initializeDirectLine = async () => {
      try {
        const token = await getDirectLineToken();
        const client = createDirectLine({ token });
        setDirectLineClient(client);
      } catch (error) {
        console.error('Failed to initialize DirectLine:', error);
        setError('Failed to connect to chat service. Please try again later.');
      }
    };
    initializeDirectLine();
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    if (isSpeechListening) stopSpeechListening();
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-600 p-4">{error}</div>;
  }

  if (!directLineClient) {
    return <div className="flex items-center justify-center h-full">Connecting...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Language:</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="p-1 text-sm border rounded bg-white"
            disabled={isSpeechListening || isProcessingSpeech}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleSpeechButtonClick}
          disabled={!isSpeechInitialized}
          className={`p-2 rounded-full relative transition-colors ${
            isSpeechListening 
              ? 'bg-red-500 text-white ring-2 ring-red-300 animate-pulse' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } ${!isSpeechInitialized ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isSpeechInitialized ? (isSpeechListening ? 'Stop listening' : 'Start voice input') : 'Voice input not available'}
        >
          {isSpeechListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ReactWebChat
          directLine={directLineClient}
          store={store}
          styleOptions={{
            botAvatarInitials: 'YB',
            userAvatarInitials: 'You',
            backgroundColor: 'white',
            bubbleBackground: '#f1f5f9',
            bubbleFromUserBackground: '#2563eb',
            bubbleFromUserTextColor: 'white',
          }}
        />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isSpeechListening 
                ? micReady 
                  ? "Listening... Speak now" 
                  : "Initializing microphone..."
                : isProcessingSpeech 
                  ? "Processing your speech..." 
                  : "Type or click mic to speak"
            }
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isProcessingSpeech}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
        
        {isSpeechListening && (
          <div className="mt-2 text-center text-sm text-blue-600 flex items-center justify-center">
            <span className="mr-2">
              {micReady ? "Listening..." : "Initializing..."}
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-center text-xs text-gray-500">
          {!isSpeechListening && !isProcessingSpeech && (
            <>
              Try saying: "
              {selectedLanguage === 'en-US' ? 'Best hotels in Colombo' :
               selectedLanguage === 'si-LK' ? 'මට යන්න ඕන.' :
               selectedLanguage === 'ta-IN' ? 'கண்டிலே நல்ல ஹோட்டல்' :
               selectedLanguage === 'zh-CN' ? '这是什么地方？' :
               selectedLanguage === 'ru-RU' ? 'Лучшие отели в коломбо' :
               'Best hotels in Colombo'}"
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotChat;