"use client";

import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <CallbackClient />
    </Suspense>
  );
}
