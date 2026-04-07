import React, { useCallback, useState } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileUploadProps {
  onSubmit: (file: File, bio: string) => void;
}

export function FileUpload({ onSubmit }: ProfileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Image Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-2xl text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-pink-500 bg-pink-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${preview ? 'p-4' : 'p-12'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Profile preview"
              className="max-h-72 rounded-xl object-cover shadow-md"
            />
            <p className="text-sm text-slate-500">Click or drop to change photo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-pink-50 rounded-full text-pink-500">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upload your profile photo</h3>
              <p className="text-sm text-slate-500 mt-1">
                Drag & drop or click to browse (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bio Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Bio & Prompts{' '}
          <span className="text-slate-400 font-normal">(optional but recommended)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={`Paste your bio, prompt answers, or any text from your dating profile here...\n\nExample:\n"Software engineer by day, amateur chef by night. Looking for someone who can keep up with my weekend hiking trips and doesn't mind the occasional kitchen experiment gone wrong."`}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none text-sm leading-relaxed text-slate-700 placeholder:text-slate-400"
          rows={6}
        />
        <p className="text-xs text-slate-400 mt-1">
          Include all bio text, Hinge prompts, interests, and anything else from your profile.
        </p>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => selectedFile && onSubmit(selectedFile, bio)}
        disabled={!selectedFile}
        className="w-full py-4 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Analyze My Profile
      </motion.button>
    </div>
  );
}
