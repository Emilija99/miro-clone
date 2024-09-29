"use client";

import { LiveblocksProvider } from "@/liveblocks.config";
import React from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return <LiveblocksProvider>{children}</LiveblocksProvider>;
};

export default Provider;
