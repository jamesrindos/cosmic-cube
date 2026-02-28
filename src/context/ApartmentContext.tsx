import { createContext, useContext, useState, ReactNode } from "react";

// Project data for VHS tapes
export const projectData: Record<string, { title: string; description: string; color: string }> = {
  MoziWash: {
    title: "MoziWash — First Billboard",
    description: "My first billboard! Turned this around in 48 hours. No sleep, fueled by Big Gulps and breakfast burritos. Got to work on it with one of my best friends.",
    color: "#FFD700",
  },
  Audien: {
    title: "Audien Hearing",
    description: "This hearing aid company saw early potential for AI CTV ads. One of many experiments we ran together.",
    color: "#2196F3",
  },
  Boldebottle: {
    title: "Boldebottle",
    description: "Got this assignment right around the launch of NanoBanana Pro. Learned that providing start frame and end frame is the move. They paid me with a shaker cup.",
    color: "#FF5722",
  },
  Sunflower1: {
    title: "Sunflower Vol 1",
    description: "Asked for 40 videos in a month. When I was tapped out, I turned to remixing iconic ad campaigns around sobriety. Really like how this one came out!",
    color: "#FFEB3B",
  },
  Sunflower2: {
    title: "Sunflower Vol 2 — Pixar",
    description: "People in the office told me this one hit emotionally but I just think the art style carried.",
    color: "#FFC107",
  },
  Dirtea: {
    title: "Dirtea",
    description: "Nootropics brand in the UK looking for a US launch. Was able to help with an Instagram reel. The physics were so hard to nail down!",
    color: "#4CAF50",
  },
  DSC: {
    title: "DSC",
    description: "Weird one. Named the characters after my brothers, twin lacrosse players. Don't think it's a winner but it makes me laugh.",
    color: "#3F51B5",
  },
  GetMTE: {
    title: "GetMTE",
    description: "A friend was making this ad and got let go, so I was tasked with repurposing it. The hook came out cool.",
    color: "#9C27B0",
  },
  JB: {
    title: "JB",
    description: "Another sleepless 48 hours. Did a ton of brand research. Spent time making it look and sound like HIM in a way that farms aura.",
    color: "#1A1A1A",
  },
  Kalshi: {
    title: "Kalshi — Wimbledon",
    description: "My friend Nate and I locked ourselves in a room the day before Wimbledon and made this spec ad. Was really cool to follow up PJ Ace's great work.",
    color: "#E91E63",
  },
  Moes: {
    title: "Moe's",
    description: "Another spec ad. Veo had been out for maybe a week. Rawdogging prompts trying to get animals to act like people. What a nightmare. Kind of holds up though.",
    color: "#FF9800",
  },
  MudWTR: {
    title: "MudWTR",
    description: "My favorite video I've made probably ever. Just so fucking cool. Opened my eyes to what was possible with AI video. This one will always take the cake.",
    color: "#795548",
  },
  Political: {
    title: "Political Campaigns",
    description: "Worked with MZL Media and Z Tribeca for a year producing content for presidents, senators, congresspeople. Incredible experience!",
    color: "#0D47A1",
  },
  Extra: {
    title: "More Coming...",
    description: "Always working on something new.",
    color: "#607D8B",
  },
};

interface ApartmentContextType {
  selectedTape: string | null;
  setSelectedTape: (tape: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const ApartmentContext = createContext<ApartmentContextType | null>(null);

export const ApartmentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTape, setSelectedTape] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <ApartmentContext.Provider
      value={{
        selectedTape,
        setSelectedTape,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </ApartmentContext.Provider>
  );
};

export const useApartment = () => {
  const context = useContext(ApartmentContext);
  if (!context) {
    throw new Error("useApartment must be used within ApartmentProvider");
  }
  return context;
};
