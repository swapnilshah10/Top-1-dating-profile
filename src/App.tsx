import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResumeViewer } from './components/ResumeViewer';
import { Dashboard } from './components/Dashboard';
import { analyzeProfile, ProfileAnalysis } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, AlertTriangle, Key } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'need_key' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bioText, setBioText] = useState<string>('');

  // Pending data when API key is missing
  const [pendingData, setPendingData] = useState<{
    imageBase64: string;
    mimeType: string;
    bio: string;
  } | null>(null);

  // API Key State
  const [savedApiKey, setSavedApiKey] = useState<string>(
    () => localStorage.getItem('gemini_api_key') || ''
  );
  const [apiKeyInput, setApiKeyInput] = useState('');

  const readFileAsBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // dataUrl = "data:<mimeType>;base64,<data>"
        const [header, data] = dataUrl.split(',');
        const mimeType = header.replace('data:', '').replace(';base64', '');
        resolve({ base64: data, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const runAnalysis = async (
    imageBase64: string,
    mimeType: string,
    bio: string,
    apiKey: string
  ) => {
    setStatus('analyzing');
    try {
      const result = await analyzeProfile(imageBase64, mimeType, bio, apiKey);
      setAnalysis(result);
      setBioText(bio);
      setStatus('done');
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('API_KEY') || error.message?.includes('API key not valid')) {
        handleClearKey();
      }
      setErrorMsg(error.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleSaveKey = async () => {
    if (apiKeyInput.trim()) {
      const key = apiKeyInput.trim();
      localStorage.setItem('gemini_api_key', key);
      setSavedApiKey(key);

      if (pendingData) {
        setPendingData(null);
        await runAnalysis(pendingData.imageBase64, pendingData.mimeType, pendingData.bio, key);
      }
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setSavedApiKey('');
    setApiKeyInput('');
    reset();
  };

  const handleProfileSubmit = async (file: File, bio: string) => {
    setErrorMsg('');
    const { base64, mimeType } = await readFileAsBase64(file);

    // Store image preview URL
    setImageUrl(URL.createObjectURL(file));

    if (!savedApiKey) {
      setPendingData({ imageBase64: base64, mimeType, bio });
      setStatus('need_key');
      return;
    }

    await runAnalysis(base64, mimeType, bio, savedApiKey);
  };

  const reset = () => {
    setStatus('idle');
    setAnalysis(null);
    setImageUrl(null);
    setBioText('');
    setErrorMsg('');
    setPendingData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-pink-600 text-white p-1.5 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Top 1% Dating Profile</span>
          </div>
          <div className="flex items-center gap-6">
            {status === 'done' && (
              <button
                onClick={reset}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Analyze New Profile
              </button>
            )}
            {savedApiKey && (
              <button
                onClick={handleClearKey}
                className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear API Key
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-6">
                  Are you getting the matches you deserve?
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Get brutally honest, AI-powered feedback on your dating profile — photo, bio,
                  and everything in between.
                </p>
              </div>

              <FileUpload onSubmit={handleProfileSubmit} />

              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">1. Upload Photo</div>
                  <div className="text-sm text-slate-500">Private — never stored on servers</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">2. AI Analysis</div>
                  <div className="text-sm text-slate-500">Photo, bio & attraction signals</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">3. Get Matches</div>
                  <div className="text-sm text-slate-500">Actionable improvements</div>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'need_key' && (
            <motion.div
              key="need_key"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-20 text-center bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Enter Gemini API Key</h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Please provide your own Google Gemini API key to run the analysis. It will be stored
                locally in your browser and never sent to our servers.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                placeholder="Your Gemini API Key..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="w-full py-4 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="w-5 h-5" />
                Save Key &amp; Analyze
              </button>
              <p className="mt-6 text-xs text-slate-400">
                Your key is stored securely in your browser's local storage only.
              </p>
            </motion.div>
          )}

          {status === 'analyzing' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-32 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-pink-500">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your profile...</h2>
              <p className="text-slate-500">
                Applying data-driven attraction insights to your photo and bio.
              </p>
              <div className="mt-8 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-pink-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-32 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analysis Failed</h2>
              <p className="text-slate-600 mb-8">{errorMsg}</p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {status === 'done' && analysis && imageUrl && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-16"
            >
              <Dashboard analysis={analysis} />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Detailed Feedback
                  </h2>
                  <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Strong
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span> Polish
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400"></span> Fix
                    </div>
                  </div>
                </div>
                <ResumeViewer
                  imageUrl={imageUrl}
                  bioText={bioText}
                  highlights={analysis.highlights}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
