"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True after hydration on the client — guards anything that must not run during SSR. */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
