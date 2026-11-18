export const CHOICES = [
  {
    id: "studio",
    index: "01",
    title: "All 1,450 for Studio Work",
    detail: "The full ₦1,450 goes to studio work.",
  },
  {
    id: "split",
    index: "02",
    title: "1,000 for Class due and 450 for studio work",
    detail: "₦1,000 is set aside for class due. ₦450 goes to studio work.",
  },
] as const;

export type Choice = (typeof CHOICES)[number]["id"];

export function isChoice(value: unknown): value is Choice {
  return value === "studio" || value === "split";
}

export function choiceTitle(choice: Choice): string {
  const match = CHOICES.find((item) => item.id === choice);
  return match ? match.title : choice;
}
