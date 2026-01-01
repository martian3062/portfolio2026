import { useContext } from "react";
import { ARContext } from "./ARProvider.jsx";

export default function useAR() {
  const ctx = useContext(ARContext);
  if (!ctx) {
    throw new Error("useAR must be used inside <ARProvider>.");
  }
  return ctx;
}
