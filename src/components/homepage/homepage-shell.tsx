"use client";

import React, { useState } from "react";
import SplashScreen from "./splash-screen";
import { Homepage } from "./homepage";

export default function HomepageShell() {
  const [showSplash, setShowSplash] = useState(true);

  return showSplash ? <SplashScreen onComplete={() => setShowSplash(false)} /> : <Homepage />;
}
