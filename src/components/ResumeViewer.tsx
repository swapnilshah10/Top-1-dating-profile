import React, { useState } from 'react';
import { ProfileHighlight } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, Camera, MessageSquare } from 'lucide-react';

interface Props {
  imageUrl: string;
  bioText: string;
  highlights: ProfileHighlight[];
}

// Splits bio text into segments, wrapping matched highlight phrases in color spans.
function buildBioSegments(
  bio: string,
  highlights: ProfileHighlight[]
): Array<{ text: string; highlight: ProfileHighlight | null }> {
  const bioHighlights = highlights.filter((h) => h.category === 'bio' && h.textToHighlight.trim());

  const positions: Array<{ start: number; end: number; highlight: ProfileHighlight }> = [];
  for (const h of bioHighlights) {
    const idx = bio.indexOf(h.textToHighlight);
    if (idx !== -1) {
      // Avoid overlapping — skip if this range is already covered
      const overlaps = positions.some((p) => p.start < idx + h.textToHighlight.length && p.end > idx);
      if (!overlaps) {
        positions.push({ start: idx, end: idx + h.textToHighlight.length, highlight: h });
      }
    }
  }
  positions.sort((a, b) => a.start - b.start);

  const segments: Array<{ text: string; highlight: ProfileHighlight | null }> = [];
  let cursor = 0;
  for (const pos of positions) {
    if (pos.start > cursor) {
      segments.push({ text: bio.slice(cursor, pos.start), highlight: null });
    }
    segments.push({ text: bio.slice(pos.start, pos.end), highlight: pos.highlight });
    cursor = pos.end;
  }
  if (cursor < bio.length) {
    segments.push({ text: bio.slice(cursor), highlight: null });
  }
  return segments;
}

function highlightBgClass(color: 'green' | 'yellow' | 'red') {
  if (color === 'green') return 'bg-emerald-200/60 border-b-2 border-emerald-500 cursor-pointer hover:bg-emerald-200';
  if (color === 'yellow') return 'bg-amber-200/60 border-b-2 border-amber-500 cursor-pointer hover:bg-amber-200';
  return 'bg-rose-200/60 border-b-2 border-rose-500 cursor-pointer hover:bg-rose-200';
}

export function ResumeViewer({ imageUrl, bioText, highlights }: Props) {
  const [hoveredHighlight, setHoveredHighlight] = useState<ProfileHighlight | null>(null);

  const photoHighlights = highlights.filter((h) => h.category === 'photo');
  const bioSegments = bioText ? buildBioSegments(bioText, highlights) : [];

  return (
    <div className="relative flex flex-col md:flex-row gap-8">
      {/* Left: Photo + Bio */}
      <div className="flex-1 space-y-8">
        {/* Profile Photo */}
        <div className="bg-slate-100 rounded-2xl shadow-inner p-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 self-start text-sm font-semibold text-slate-600 uppercase tracking-widest">
            <Camera className="w-4 h-4" />
            Profile Photo
          </div>
          <img
            src={imageUrl}
            alt="Dating profile"
            className="max-h-[480px] rounded-xl object-cover shadow-lg"
          />

          {/* Photo feedback chips */}
          {photoHighlights.length > 0 && (
            <div className="w-full space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Photo Feedback
              </p>
              <div className="flex flex-wrap gap-2">
                {photoHighlights.map((h, i) => {
                  const chipColor =
                    h.color === 'green'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : h.color === 'yellow'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200';
                  return (
                    <button
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-opacity hover:opacity-80 ${chipColor}`}
                      onMouseEnter={() => setHoveredHighlight(h)}
                      onMouseLeave={() => setHoveredHighlight(null)}
                    >
                      {h.before.length > 40 ? h.before.slice(0, 40) + '…' : h.before}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bio with highlights */}
        {bioText && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-widest">
              <MessageSquare className="w-4 h-4" />
              Bio &amp; Prompts
            </div>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {bioSegments.map((seg, i) =>
                seg.highlight ? (
                  <span
                    key={i}
                    className={`rounded px-0.5 ${highlightBgClass(seg.highlight.color)}`}
                    onMouseEnter={() => setHoveredHighlight(seg.highlight!)}
                    onMouseLeave={() => setHoveredHighlight(null)}
                  >
                    {seg.text}
                  </span>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </p>
          </div>
        )}
      </div>

      {/* Right: Hover Tooltip Panel */}
      <div className="w-full md:w-80 shrink-0">
        <div className="sticky top-8">
          <AnimatePresence mode="wait">
            {hoveredHighlight ? (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                <div
                  className={`p-4 border-b flex items-center gap-3 ${
                    hoveredHighlight.color === 'green'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      : hoveredHighlight.color === 'yellow'
                      ? 'bg-amber-50 border-amber-100 text-amber-800'
                      : 'bg-rose-50 border-rose-100 text-rose-800'
                  }`}
                >
                  {hoveredHighlight.color === 'green' && <CheckCircle2 className="w-5 h-5" />}
                  {hoveredHighlight.color === 'yellow' && <Info className="w-5 h-5" />}
                  {hoveredHighlight.color === 'red' && <AlertTriangle className="w-5 h-5" />}
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wider">
                      {hoveredHighlight.color === 'green'
                        ? 'Strong Element'
                        : hoveredHighlight.color === 'yellow'
                        ? 'Needs Polish'
                        : 'Critical Fix'}
                    </h4>
                    <span className="text-xs opacity-70 capitalize">{hoveredHighlight.category} feedback</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Current
                    </div>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 line-through decoration-slate-400 opacity-70">
                      {hoveredHighlight.before}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Suggested
                    </div>
                    <div className="text-sm text-slate-900 bg-pink-50 p-3 rounded-lg border border-pink-100 font-medium">
                      {hoveredHighlight.after}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Why it matters
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {hoveredHighlight.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500 flex flex-col items-center justify-center h-64"
              >
                <Info className="w-8 h-8 mb-3 text-slate-400" />
                <p className="text-sm">
                  Hover over a highlighted phrase in your bio or a photo feedback chip to see detailed suggestions.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
