"use client";

import { useUIStore } from "@/store/useUIStore";
import { useState } from "react";
import { MdClose, MdGraphicEq } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function EqualizerModal() {
  const { equalizerOpen, setEqualizerOpen, addToast } = useUIStore();
  const [quality, setQuality] = useState("High");
  const [preset, setPreset] = useState("Bass Boost");
  const [eqValues, setEqValues] = useState([6, 4, 1, -2, 3]); // 60Hz, 230Hz, 910Hz, 4kHz, 14kHz

  if (!equalizerOpen) return null;

  const presets: Record<string, number[]> = {
    "Flat": [0, 0, 0, 0, 0],
    "Bass Boost": [6, 4, 1, -2, 3],
    "Vocal": [-2, 2, 5, 3, 0],
    "Treble Boost": [-3, -1, 1, 4, 6],
    "Electronic": [5, 3, -1, 2, 5],
  };

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    setEqValues(presets[newPreset]);
    addToast(`Applied EQ preset: ${newPreset}`, "info");
  };

  const bands = ["60Hz", "230Hz", "910Hz", "4kHz", "14kHz"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#282828] text-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-green-500 font-bold text-xl">
              <MdGraphicEq size={26} />
              <h2 className="text-white">Audio Settings & Equalizer</h2>
            </div>
            <button onClick={() => setEqualizerOpen(false)} className="text-gray-400 hover:text-white">
              <MdClose size={24} />
            </button>
          </div>

          {/* Audio Quality Dropdown */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Streaming Quality</label>
            <select
              value={quality}
              onChange={(e) => {
                setQuality(e.target.value);
                addToast(`Audio quality set to ${e.target.value}`, "info");
              }}
              className="w-full bg-[#333333] text-white rounded-lg p-3 outline-none border border-gray-600 focus:border-green-500 text-sm"
            >
              <option value="Low">Low (24 kbps)</option>
              <option value="Normal">Normal (96 kbps)</option>
              <option value="High">High (160 kbps)</option>
              <option value="Very High">Very High (320 kbps - Lossless)</option>
            </select>
          </div>

          {/* Equalizer Presets */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Equalizer Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(presets).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetChange(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    preset === p
                      ? "bg-green-500 text-black shadow-lg"
                      : "bg-[#333333] text-white hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Band Equalizer Sliders */}
          <div className="space-y-4 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">5-Band Frequency Response</label>
            <div className="grid grid-cols-5 gap-4 h-48 items-center bg-[#1e1e1e] p-4 rounded-xl">
              {bands.map((band, idx) => (
                <div key={band} className="flex flex-col items-center h-full justify-between">
                  <span className="text-xs text-green-400 font-bold">{eqValues[idx] > 0 ? `+${eqValues[idx]}` : eqValues[idx]}dB</span>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    value={eqValues[idx]}
                    onChange={(e) => {
                      const newVals = [...eqValues];
                      newVals[idx] = Number(e.target.value);
                      setEqValues(newVals);
                    }}
                    className="h-32 -rotate-90 w-2 accent-green-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 font-semibold">{band}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
