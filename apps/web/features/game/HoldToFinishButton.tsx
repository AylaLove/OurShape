"use client";

import { Check } from "lucide-react";
import { useRef, useState } from "react";

const HOLD_MS = 750;

export function HoldToFinishButton({ onFinish, label = "Hold: it's done" }: { onFinish: () => void; label?: string }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  function start() {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onFinish();
    }, HOLD_MS);
  }

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  return (
    <button
      className={holding ? "finish-button finish-button--holding" : "finish-button"}
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onFinish();
        } else if (event.key === " " && !holding) start();
      }}
      onKeyUp={cancel}
    >
      <span className="finish-button__fill" aria-hidden="true" />
      <Check size={21} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
