"use client";

import { Loader } from "lucide-react";
import React from "react";
import Info from "./info";
import Participants from "./participants";
import Toolbar from "./toolbar";

const Loading = () => {
  return (
    <main className="w-full h-full relative bg-neutral-100 touch-none flex items-center justify-center">
      <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      <Info.Skeleton />
      <Participants.Skeleton />
      <Toolbar.Skeleton />
    </main>
  );
};

export default Loading;
