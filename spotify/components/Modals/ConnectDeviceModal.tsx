"use client";

import { useUIStore } from "@/store/useUIStore";
import { usePlayerStore } from "@/store/playerStore";
import { useState } from "react";
import { MdLaptop, MdSmartphone, MdSpeaker, MdCheck, MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectDeviceModal() {
  const { connectDeviceOpen, setConnectDeviceOpen, addToast } = useUIStore();
  const { volume, setVolume } = usePlayerStore();
  const [activeDeviceId, setActiveDeviceId] = useState("web-browser");

  if (!connectDeviceOpen) return null;

  const devices = [
    { id: "web-browser", name: "This Web Browser (Chrome)", type: "Computer", icon: MdLaptop },
    { id: "mobile-phone", name: "Vaibhav's iPhone 15 Pro", type: "Smartphone", icon: MdSmartphone },
    { id: "living-speaker", name: "Living Room Sonos Speaker", type: "Smart Speaker", icon: MdSpeaker },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#282828] text-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Connect to a device</h2>
            <button onClick={() => setConnectDeviceOpen(false)} className="text-gray-400 hover:text-white">
              <MdClose size={24} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {devices.map((device) => {
              const Icon = device.icon;
              const isActive = activeDeviceId === device.id;
              return (
                <div
                  key={device.id}
                  onClick={() => {
                    setActiveDeviceId(device.id);
                    addToast(`Connected to ${device.name}`, "success");
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    isActive ? "bg-[#333333] border border-green-500/50" : "hover:bg-[#333333]/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={28} className={isActive ? "text-green-500" : "text-gray-400"} />
                    <div>
                      <p className={`font-semibold text-sm ${isActive ? "text-green-400" : "text-white"}`}>
                        {device.name}
                      </p>
                      <p className="text-xs text-gray-400">{device.type}</p>
                    </div>
                  </div>
                  {isActive && <MdCheck size={24} className="text-green-500" />}
                </div>
              );
            })}
          </div>

          {/* Volume Synchronization Slider */}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Device Volume</span>
              <span>{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
