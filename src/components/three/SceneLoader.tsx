"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Variant B brings its own glass scene; every other route shares the particle field */
export default function SceneLoader() {
  const pathname = usePathname();
  if (pathname.startsWith("/v2")) return null;
  return <Scene />;
}
