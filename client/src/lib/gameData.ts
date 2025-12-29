export type Player = {
  id: number;
  name: string;
  color: string;
  stats: {
    health: number;
    money: number;
    sanity: number;
    age: number;
  };
  position: number;
  isDead: boolean;
};

export type Choice = {
  text: string;
  effect: (player: Player) => Partial<Player['stats']>;
  description: string;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
};

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: "P1", color: "text-primary", stats: { health: 100, money: 50, sanity: 100, age: 18 }, position: 0, isDead: false },
  { id: 2, name: "P2", color: "text-secondary", stats: { health: 100, money: 50, sanity: 100, age: 18 }, position: 0, isDead: false },
  { id: 3, name: "P3", color: "text-accent", stats: { health: 100, money: 50, sanity: 100, age: 18 }, position: 0, isDead: false },
  { id: 4, name: "P4", color: "text-destructive", stats: { health: 100, money: 50, sanity: 100, age: 18 }, position: 0, isDead: false },
];

export const EVENTS: GameEvent[] = [
  {
    id: "student_debt",
    title: "The Burden Begins",
    description: "You are accepted into a prestigious university. The tuition is astronomical, but the promise of a future keeps you warm.",
    choices: [
      {
        text: "Take the Loan",
        description: "-$50 Money, +10 Sanity (Hope)",
        effect: () => ({ money: -50, sanity: 10 })
      },
      {
        text: "Skip College",
        description: "+0 Money, -20 Sanity (FOMO)",
        effect: () => ({ money: 0, sanity: -20 })
      }
    ]
  },
  {
    id: "first_job",
    title: "Corporate Gear",
    description: "You land a job. It's soul-crushing data entry.",
    choices: [
      {
        text: "Work Hard",
        description: "+20 Money, -15 Health",
        effect: () => ({ money: 20, health: -15 })
      },
      {
        text: "Slack Off",
        description: "+5 Money, +5 Sanity",
        effect: () => ({ money: 5, sanity: 5 })
      }
    ]
  },
  {
    id: "relationship",
    title: "Entanglement",
    description: "You meet someone who tolerates your existence.",
    choices: [
      {
        text: "Commit",
        description: "-10 Money, +20 Sanity",
        effect: () => ({ money: -10, sanity: 20 })
      },
      {
        text: "Stay Alone",
        description: "+10 Money, -10 Sanity",
        effect: () => ({ money: 10, sanity: -10 })
      }
    ]
  },
  {
    id: "burnout",
    title: "System Failure",
    description: "Your body rejects the 80-hour work week.",
    choices: [
      {
        text: "Hospitalize",
        description: "-40 Money, +30 Health",
        effect: () => ({ money: -40, health: 30 })
      },
      {
        text: "Power Through",
        description: "+10 Money, -30 Health",
        effect: () => ({ money: 10, health: -30 })
      }
    ]
  },
  {
    id: "crisis",
    title: "Mid-Life Void",
    description: "You realize you have achieved nothing of significance.",
    choices: [
      {
        text: "Buy Sports Car",
        description: "-60 Money, +10 Sanity",
        effect: () => ({ money: -60, sanity: 10 })
      },
      {
        text: "Therapy",
        description: "-20 Money, +20 Sanity",
        effect: () => ({ money: -20, sanity: 20 })
      }
    ]
  }
];
