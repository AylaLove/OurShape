import Image from "next/image";
import type { HomeDinosaurState } from "./companion-state";

const POSES: Record<HomeDinosaurState, { file: string; alt: string }> = {
  resting: {
    file: "/companion/home-dinosaur-neutral-v1.png",
    alt: "The Home Dinosaur resting peacefully",
  },
  curious: {
    file: "/companion/home-dinosaur-curious-v1.png",
    alt: "The Home Dinosaur looking curiously at what needs doing",
  },
  inviting: {
    file: "/companion/home-dinosaur-curious-v1.png",
    alt: "The Home Dinosaur inviting someone to help",
  },
  ready: {
    file: "/companion/home-dinosaur-encouraging-v1.png",
    alt: "The Home Dinosaur ready to begin a household quest",
  },
  teamwork: {
    file: "/companion/home-dinosaur-celebrating-v1.png",
    alt: "The Home Dinosaur celebrating that people joined together",
  },
  encouraging: {
    file: "/companion/home-dinosaur-encouraging-v1.png",
    alt: "The Home Dinosaur cheering someone on",
  },
  celebrating: {
    file: "/companion/home-dinosaur-celebrating-v1.png",
    alt: "The Home Dinosaur celebrating teamwork",
  },
  "carrying-energy": {
    file: "/companion/home-dinosaur-carrying-energy-v1.png",
    alt: "The Home Dinosaur carrying appreciation energy",
  },
  "sharing-energy": {
    file: "/companion/home-dinosaur-sharing-energy-v1.png",
    alt: "The Home Dinosaur sharing appreciation energy with the home",
  },
  sleeping: {
    file: "/companion/home-dinosaur-sleeping-v1.png",
    alt: "The Home Dinosaur sleeping during quiet hours",
  },
  gratitude: {
    file: "/companion/home-dinosaur-gratitude-closeup-v1.png",
    alt: "The Home Dinosaur giving a warm thank you",
  },
  repairing: {
    file: "/companion/home-dinosaur-curious-v1.png",
    alt: "The Home Dinosaur gently noticing that something needs repairing",
  },
};

export function HomeDinosaur({
  state,
  size = "large",
  priority = false,
  character = "home-dinosaur",
}: {
  state: HomeDinosaurState;
  size?: "small" | "medium" | "large";
  priority?: boolean;
  character?: "home-dinosaur" | "sage-trex";
}) {
  const pose = POSES[state];
  const image = character === "sage-trex"
    ? {
        file: "/companion/sage-trex-neutral-v1.png",
        alt: "Sage's friendly T-Rex helper",
      }
    : pose;

  return (
    <span className={`home-dinosaur home-dinosaur--${size} home-dinosaur--${state} home-dinosaur--${character}`}>
      <Image
        src={image.file}
        alt={image.alt}
        width={444}
        height={444}
        sizes={size === "large" ? "(max-width: 760px) 42vw, 290px" : "150px"}
        priority={priority}
      />
    </span>
  );
}
