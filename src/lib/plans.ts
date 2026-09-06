export type PlanId = "free" | "premium" | "super_premium";

export interface PlanInfo {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  usageLimit: number;
  usageLabel: string;
  resetMonthly: boolean;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try Clipper",
    priceMonthly: 0,
    usageLimit: 5,
    usageLabel: "5 analyses",
    resetMonthly: false,
    features: [
      "5 video analyses",
      "Scene and moment detection",
      "Clip editor with trimming",
      "Export clips",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For regular creators",
    priceMonthly: 9,
    usageLimit: 50,
    usageLabel: "50 analyses per month",
    resetMonthly: true,
    highlighted: true,
    features: [
      "Analyses reset each month",
      "Scene and moment detection",
      "Clip editor with trimming",
      "Export clips",
      "Priority support",
    ],
  },
  {
    id: "super_premium",
    name: "Super Premium",
    tagline: "For power creators",
    priceMonthly: 19,
    usageLimit: -1,
    usageLabel: "Unlimited analyses",
    resetMonthly: false,
    features: [
      "No usage limits",
      "Scene and moment detection",
      "Clip editor with trimming",
      "Export clips",
      "Priority support",
      "Early access to new tools",
    ],
  },
];

export const PLAN_MAP: Record<PlanId, PlanInfo> = Object.fromEntries(
  PLANS.map((p) => [p.id, p])
) as Record<PlanId, PlanInfo>;

export const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  premium: "Premium",
  super_premium: "Super Premium",
};

export const isPaidPlan = (plan: string | undefined | null): plan is "premium" | "super_premium" =>
  plan === "premium" || plan === "super_premium";

export const UPGRADE_PATHS: Record<PlanId, PlanId | null> = {
  free: "premium",
  premium: "super_premium",
  super_premium: null,
};