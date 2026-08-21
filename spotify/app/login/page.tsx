"use client";

import { signIn } from "next-auth/react";
import { FaGoogle, FaSpotify } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#121212] text-white p-6">
      <div className="w-full max-w-md bg-[#181818] p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center border border-[#2a2a2a]">
        {/* Spotify Icon Header */}
        <div className="w-16 h-16 rounded-full bg-[#1ed760] flex items-center justify-center mb-6 shadow-lg">
          <FaSpotify size={36} className="text-black" />
        </div>

        <h1 className="text-3xl font-black mb-2 text-white tracking-tight">Log in to Spotify</h1>
        <p className="text-[#b3b3b3] text-sm mb-8">
          Millions of songs and podcasts. No credit card needed.
        </p>

        {/* Google OAuth Login Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 px-6 rounded-full hover:scale-[1.02] transition-transform shadow-md text-sm border border-gray-300"
        >
          <FaGoogle size={18} className="text-[#ea4335]" />
          <span>Continue with Google</span>
        </button>

        <div className="my-6 w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <span className="text-xs text-[#b3b3b3] uppercase tracking-widest font-semibold">OR</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        {/* Guest Demo Login */}
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-[#1f1f1f] text-white font-bold py-3.5 px-6 rounded-full hover:bg-[#2a2a2a] transition-colors text-sm border border-[#4d4d4d]"
        >
          Continue as Guest
        </button>

        <p className="text-xs text-[#b3b3b3] mt-8">
          By continuing, you agree to Spotify&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
