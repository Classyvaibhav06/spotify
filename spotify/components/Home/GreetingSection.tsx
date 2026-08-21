"use client";

import { useMemo } from "react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function GreetingSection() {
  const greeting = useMemo(getGreeting, []);
  return (
    /* section-title: SpotifyMixUITitle 24px/700 */
    <h1 className="type-section-title mb-6" style={{ color: "var(--text-base)" }}>
      {greeting}
    </h1>
  );
}
