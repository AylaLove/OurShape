"use client";

import { Hand, Sparkles, X } from "lucide-react";
import { useEffect } from "react";

export interface GratitudeMomentData {
  title: string;
  message: string;
  pointsLabel?: string;
  homeEnergyLabel?: string;
}

export function GratitudeMoment({ moment, onClose }: { moment: GratitudeMomentData; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="gratitude-moment" role="status" aria-live="polite">
      <button type="button" onClick={onClose} aria-label="Close celebration"><X size={18} /></button>
      <span className="gratitude-moment__icon"><Hand size={38} /></span>
      <div>
        <p className="eyebrow">HIGH FIVE</p>
        <h2>{moment.title}</h2>
        <p>{moment.message}</p>
        {(moment.pointsLabel || moment.homeEnergyLabel) ? (
          <div className="gratitude-moment__results">
            {moment.pointsLabel ? <span>{moment.pointsLabel}</span> : null}
            {moment.homeEnergyLabel ? <span><Sparkles size={14} /> {moment.homeEnergyLabel}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
