export type Ingredient = {
  id: string;
  name: string;
  qty: string;
  category: "Produce" | "Dairy" | "Grains" | "Proteins" | "Spices" | "Pantry";
  emoji: string;
  status: "fresh" | "soon" | "expired";
  expiryLabel: string;
  confidence?: number;
};

export const PANTRY: Ingredient[] = [
  { id: "spinach", name: "Baby spinach", qty: "1 bag", category: "Produce", emoji: "🥬", status: "soon", expiryLabel: "2 days", confidence: 0.96 },
  { id: "yogurt", name: "Greek yogurt", qty: "500 g", category: "Dairy", emoji: "🥛", status: "soon", expiryLabel: "3 days", confidence: 0.98 },
  { id: "cilantro", name: "Cilantro", qty: "1 bunch", category: "Produce", emoji: "🌿", status: "expired", expiryLabel: "Today", confidence: 0.92 },
  { id: "chicken", name: "Chicken breast", qty: "600 g", category: "Proteins", emoji: "🍗", status: "fresh", expiryLabel: "5 days", confidence: 0.99 },
  { id: "rice", name: "Brown rice", qty: "1.2 kg", category: "Grains", emoji: "🍚", status: "fresh", expiryLabel: "6 mo", confidence: 1 },
  { id: "feta", name: "Feta cheese", qty: "200 g", category: "Dairy", emoji: "🧀", status: "fresh", expiryLabel: "12 days", confidence: 0.97 },
  { id: "cumin", name: "Cumin", qty: "1 jar", category: "Spices", emoji: "🌶️", status: "fresh", expiryLabel: "1 yr", confidence: 1 },
  { id: "tomato", name: "Cherry tomatoes", qty: "1 punnet", category: "Produce", emoji: "🍅", status: "soon", expiryLabel: "4 days", confidence: 0.94 },
  { id: "lemon", name: "Lemons", qty: "4", category: "Produce", emoji: "🍋", status: "fresh", expiryLabel: "10 days", confidence: 0.99 },
  { id: "eggs", name: "Free-range eggs", qty: "10", category: "Proteins", emoji: "🥚", status: "fresh", expiryLabel: "14 days", confidence: 1 },
  { id: "onion", name: "Red onions", qty: "3", category: "Produce", emoji: "🧅", status: "fresh", expiryLabel: "3 wk", confidence: 0.98 },
  { id: "garlic", name: "Garlic", qty: "1 bulb", category: "Produce", emoji: "🧄", status: "fresh", expiryLabel: "1 mo", confidence: 0.99 },
];

export type Recipe = {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  kcal: number;
  protein: number;
  difficulty: "Easy" | "Medium" | "Hard";
  uses: number;
  total: number;
  why: string[];
  ingredients: { name: string; qty: string; have: boolean }[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: "lemon-herb-chicken",
    title: "Lemon herb chicken with charred greens",
    emoji: "🍋",
    minutes: 25,
    kcal: 480,
    protein: 42,
    difficulty: "Easy",
    uses: 8,
    total: 10,
    why: [
      "Uses cilantro and spinach expiring this week",
      "42 g protein and aligned with your goal",
      "One pan in 25 minutes",
    ],
    ingredients: [
      { name: "Chicken breast", qty: "600 g", have: true },
      { name: "Baby spinach", qty: "1 bag", have: true },
      { name: "Cilantro", qty: "1 bunch", have: true },
      { name: "Lemons", qty: "2", have: true },
      { name: "Garlic", qty: "3 cloves", have: true },
      { name: "Olive oil", qty: "3 tbsp", have: true },
      { name: "Cumin", qty: "1 tsp", have: true },
      { name: "Feta cheese", qty: "80 g", have: true },
      { name: "Butter", qty: "1 tbsp", have: false },
      { name: "Parsley", qty: "1/2 bunch", have: false },
    ],
    steps: [
      "Pat chicken dry and season with salt, cumin and lemon zest.",
      "Sear chicken in olive oil for 4 minutes each side.",
      "Add garlic and lemon juice, cover, and cook for 6 minutes.",
      "Move chicken aside and wilt spinach in the same pan.",
      "Plate with feta, cilantro, and remaining lemon.",
    ],
  },
  {
    id: "spinach-feta-pasta",
    title: "Spinach and feta pasta",
    emoji: "🍝",
    minutes: 18,
    kcal: 520,
    protein: 22,
    difficulty: "Easy",
    uses: 6,
    total: 8,
    why: ["Rescues spinach expiring in 2 days", "Under 20 minutes", "Family favorite"],
    ingredients: [
      { name: "Pasta", qty: "300 g", have: false },
      { name: "Baby spinach", qty: "1 bag", have: true },
      { name: "Feta cheese", qty: "150 g", have: true },
      { name: "Garlic", qty: "3 cloves", have: true },
      { name: "Lemons", qty: "1", have: true },
      { name: "Olive oil", qty: "3 tbsp", have: true },
      { name: "Chili flakes", qty: "1 tsp", have: false },
    ],
    steps: [
      "Boil pasta until al dente.",
      "Saute garlic in olive oil and add chili flakes.",
      "Toss with pasta, spinach, feta, and lemon zest.",
    ],
  },
  {
    id: "chickpea-stew",
    title: "One-pot chickpea stew",
    emoji: "🥣",
    minutes: 30,
    kcal: 410,
    protein: 18,
    difficulty: "Easy",
    uses: 7,
    total: 9,
    why: ["Uses tomatoes and onions on hand", "Plant-forward", "Great leftovers"],
    ingredients: [
      { name: "Chickpeas", qty: "2 cans", have: false },
      { name: "Cherry tomatoes", qty: "1 punnet", have: true },
      { name: "Red onions", qty: "1", have: true },
      { name: "Garlic", qty: "3 cloves", have: true },
      { name: "Cumin", qty: "2 tsp", have: true },
      { name: "Baby spinach", qty: "1/2 bag", have: true },
      { name: "Lemons", qty: "1", have: true },
      { name: "Coconut milk", qty: "1 can", have: false },
      { name: "Olive oil", qty: "2 tbsp", have: true },
    ],
    steps: [
      "Soften onion and garlic in olive oil.",
      "Add cumin, tomatoes, chickpeas, and coconut milk. Simmer 15 minutes.",
      "Stir through spinach and lemon.",
    ],
  },
];

export const SUGGESTED_PROMPTS = [
  "What should I cook tonight?",
  "Plan my week",
  "Show my pantry",
  "What is expiring?",
  "Healthy dinner ideas",
  "Generate shopping list",
];

export const SHOPPING_LIST = {
  today: [
    { name: "Butter", qty: "250 g", price: 3.2, aisle: "Dairy" },
    { name: "Parsley", qty: "1 bunch", price: 1.5, aisle: "Produce" },
  ],
  week: [
    { name: "Pasta", qty: "500 g", price: 2.4, aisle: "Grains" },
    { name: "Chickpeas", qty: "2 cans", price: 3.0, aisle: "Pantry" },
    { name: "Coconut milk", qty: "1 can", price: 2.2, aisle: "Pantry" },
    { name: "Chili flakes", qty: "1 jar", price: 2.8, aisle: "Spices" },
    { name: "Olive oil", qty: "500 ml", price: 8.9, aisle: "Pantry" },
  ],
};

export function getRecipe(id: string): Recipe {
  return RECIPES.find((recipe) => recipe.id === id) ?? RECIPES[0];
}
