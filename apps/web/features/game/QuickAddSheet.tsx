import type { DailyQuest } from "@family-game/domain";
import { Flower2, Home, Sparkles, Trees, Utensils, X } from "lucide-react";

export type QuickQuest = Omit<DailyQuest, "id" | "householdId" | "templateId" | "state" | "participantIds" | "dueDate" | "urgency" | "completedAt">;

const PRESETS: Array<QuickQuest & { Icon: typeof Home }> = [
  { title: "Dishes", instruction: "Clear, wash, and leave the sink ready.", spokenInstruction: "The dishes need us. Clear, wash, and leave the sink ready.", kind: "open", effort: "light", appreciationValue: 1, contributionValue: 1, icon: "dishes", suggestedMemberIds: [], Icon: Utensils },
  { title: "Fetch wood", instruction: "Bring in enough dry wood for the next fire.", spokenInstruction: "The wood basket needs filling.", kind: "open", effort: "light", appreciationValue: 1, contributionValue: 1, icon: "wood", suggestedMemberIds: [], Icon: Trees },
  { title: "Water plants", instruction: "Check the soil, then water the thirsty plants.", spokenInstruction: "The plants are asking for care.", kind: "care", effort: "light", appreciationValue: 1, contributionValue: 1, icon: "plant", suggestedMemberIds: [], Icon: Flower2 },
  { title: "Ten-minute reset", instruction: "Everyone resets one shared room for ten minutes.", spokenInstruction: "Whole home quest. Let’s reset one room together.", kind: "family", effort: "medium", appreciationValue: 2, contributionValue: 2, icon: "home", suggestedMemberIds: [], Icon: Home },
  { title: "Someone helped", instruction: "Record an unplanned act of help or care.", spokenInstruction: "Someone noticed a helpful thing you did.", kind: "surprise_help", effort: "light", appreciationValue: 1, contributionValue: 1, icon: "sparkle", suggestedMemberIds: [], Icon: Sparkles },
];

export function QuickAddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (quest: QuickQuest) => void }) {
  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quick-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
        <header><div><p className="eyebrow">QUICK ADD</p><h2 id="quick-add-title">What needs doing?</h2></div><button className="round-button round-button--plain" type="button" onClick={onClose} aria-label="Close quick add"><X size={20} /></button></header>
        <div className="quick-grid">
          {PRESETS.map(({ Icon, ...preset }) => <button type="button" key={preset.title} onClick={() => onAdd(preset)}><Icon size={26} /><span>{preset.title}</span></button>)}
        </div>
      </section>
    </div>
  );
}
