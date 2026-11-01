export type Budget = {
  raw: string;
  amount: number;
  currency: string;
};

export type Extraction = {
  keywords: string[];
  tenderTerms: string[];
  deadlines: string[];
  budgets: Budget[];
};

export type Analysis = {
  id: string;
  createdAt: string;
  text: string;
  extraction: Extraction;
};
