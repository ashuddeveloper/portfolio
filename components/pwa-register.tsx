"use client";

import { useEffect } from "react";

import { BASE_PATH } from "@/lib/utils";

/** Registers the offline service worker — production builds only. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker
        .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` })
        .catch(() => {
          /* offline support is progressive enhancement — never block the page */
        });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
