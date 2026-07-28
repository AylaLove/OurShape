"use client";

import type { EffortSize, HouseholdMember, QuestScope } from "@family-game/domain";
import {
  Home,
  ListPlus,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildQuickQuest,
  QUEST_CATEGORY_OPTIONS,
  type QuickQuest,
  type QuickQuestDraft,
} from "./quick-quest";

export type { QuickQuest } from "./quick-quest";

const PRESETS: QuickQuestDraft[] = [
  {
    title: "Dishes",
    instruction: "Clear, wash, and leave the sink ready.",
    scope: "home",
    categoryId: "home-kitchen",
    effort: "light",
    suggestedMemberId: null,
  },
  {
    title: "Pack away laundry",
    instruction: "Sort the clean clothes and return them to their homes.",
    scope: "home",
    categoryId: "home-laundry",
    effort: "medium",
    suggestedMemberId: null,
  },
  {
    title: "School reading",
    instruction: "Read for fifteen calm minutes.",
    scope: "personal",
    categoryId: "personal-learning",
    effort: "light",
    suggestedMemberId: null,
  },
];

function firstCategory(scope: QuestScope) {
  return QUEST_CATEGORY_OPTIONS.find((option) => option.scope === scope)?.id ?? "";
}

export function QuickAddSheet({
  members,
  onClose,
  onAdd,
}: {
  members: HouseholdMember[];
  onClose: () => void;
  onAdd: (quest: QuickQuest) => void;
}) {
  const [scope, setScope] = useState<QuestScope>("home");
  const [categoryId, setCategoryId] = useState(firstCategory("home"));
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [effort, setEffort] = useState<EffortSize>("light");
  const [suggestedMemberId, setSuggestedMemberId] = useState("");

  const categories = useMemo(
    () => QUEST_CATEGORY_OPTIONS.filter((option) => option.scope === scope),
    [scope],
  );
  const draft: QuickQuestDraft = {
    title,
    instruction,
    scope,
    categoryId,
    effort,
    suggestedMemberId: suggestedMemberId || null,
  };
  const quest = buildQuickQuest(draft);

  function changeScope(nextScope: QuestScope) {
    setScope(nextScope);
    setCategoryId(firstCategory(nextScope));
    setSuggestedMemberId(nextScope === "personal" ? members[0]?.id ?? "" : "");
  }

  function usePreset(preset: QuickQuestDraft) {
    const ownerId = preset.scope === "personal"
      ? members.find((member) => member.role === "child")?.id ?? members[0]?.id ?? ""
      : "";
    setScope(preset.scope);
    setCategoryId(preset.categoryId);
    setTitle(preset.title);
    setInstruction(preset.instruction);
    setEffort(preset.effort);
    setSuggestedMemberId(ownerId);
  }

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quick-sheet quick-sheet--creator" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
        <header>
          <div>
            <p className="eyebrow">ADD TO TODAY</p>
            <h2 id="quick-add-title">What needs doing?</h2>
          </div>
          <button className="round-button round-button--plain" type="button" onClick={onClose} aria-label="Close task creator"><X size={20} /></button>
        </header>

        <div className="quick-sheet__presets" aria-label="Quick task ideas">
          {PRESETS.map((preset) => (
            <button type="button" key={preset.title} onClick={() => usePreset(preset)}>
              {preset.title}
            </button>
          ))}
        </div>

        <fieldset className="scope-control">
          <legend>What kind of contribution is this?</legend>
          <button
            className={scope === "home" ? "scope-control__option scope-control__option--active" : "scope-control__option"}
            type="button"
            onClick={() => changeScope("home")}
          >
            <Home size={20} />
            <span><strong>Home contribution</strong><small>Helps our shared home and adds Home Energy.</small></span>
          </button>
          <button
            className={scope === "personal" ? "scope-control__option scope-control__option--active" : "scope-control__option"}
            type="button"
            onClick={() => changeScope("personal")}
          >
            <Sparkles size={20} />
            <span><strong>Personal responsibility</strong><small>School, admin, maintenance, health, or personal growth.</small></span>
          </button>
        </fieldset>

        <label className="form-field">
          <span>Category</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {categories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
          </select>
        </label>

        <label className="form-field">
          <span>Task name</span>
          <input
            maxLength={80}
            placeholder={scope === "home" ? "e.g. Clean the fridge" : "e.g. School project"}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>What counts as done?</span>
          <textarea
            maxLength={240}
            rows={3}
            placeholder="Give one clear, finishable instruction."
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
          />
        </label>

        <div className="quick-sheet__row">
          <label className="form-field">
            <span>{scope === "personal" ? "Whose responsibility?" : "Suggest it to"}</span>
            <select value={suggestedMemberId} onChange={(event) => setSuggestedMemberId(event.target.value)}>
              {scope === "home" ? <option value="">Anyone can help</option> : null}
              {members.map((member) => <option value={member.id} key={member.id}>{member.displayName}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span>Effort and High Fives</span>
            <select value={effort} onChange={(event) => setEffort(event.target.value as EffortSize)}>
              <option value="light">Light · 1</option>
              <option value="medium">Medium · 2</option>
              <option value="substantial">Big · 4</option>
            </select>
          </label>
        </div>

        <p className="quick-sheet__rule">
          {scope === "home"
            ? "Everyone who helps earns the High Fives. The household also gains 1 Home Energy."
            : "The person earns High Fives after someone notices the work. Personal responsibilities do not add Home Energy."}
        </p>

        <button
          className="primary-button"
          type="button"
          disabled={!quest}
          onClick={() => quest && onAdd(quest)}
        >
          <ListPlus size={21} aria-hidden="true" />
          Add to today
        </button>
      </section>
    </div>
  );
}
