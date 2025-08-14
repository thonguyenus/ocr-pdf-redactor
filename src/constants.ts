// Term Deposit Rates Constants
export interface TermDepositRate {
  term: string;
  rate: number;
  unit: "days" | "months" | "years";
}

export const TERM_DEPOSIT_RATES: TermDepositRate[] = [
  { term: "7", rate: 0.25, unit: "days" },
  { term: "14", rate: 0.5, unit: "days" },
  { term: "30", rate: 2.75, unit: "days" },
  { term: "60", rate: 3.25, unit: "days" },
  { term: "90", rate: 4.0, unit: "days" },
  { term: "4", rate: 4.0, unit: "months" },
  { term: "5", rate: 4.05, unit: "months" },
  { term: "6", rate: 4.05, unit: "months" },
  { term: "7", rate: 3.95, unit: "months" },
  { term: "8", rate: 3.9, unit: "months" },
  { term: "9", rate: 3.8, unit: "months" },
  { term: "10", rate: 3.8, unit: "months" },
  { term: "11", rate: 4.0, unit: "months" },
  { term: "1", rate: 4.0, unit: "years" },
];

// Additional constants from the image
export const INTEREST_PAYMENT_FREQUENCY = "annually";
export const APPROVAL_CODE = "MAZ324";
export const RATE_UPDATE_FREQUENCY = "weekly"; // Based on "Terms with rates are sent wee" (likely weekly)

// Helper function to format term display
export const formatTermDisplay = (rate: TermDepositRate): string => {
  if (rate.unit === "days") {
    return `${rate.term} ${rate.unit}`;
  } else if (rate.unit === "months") {
    return `${rate.term} ${rate.unit}`;
  } else {
    return `${rate.term} ${rate.unit}`;
  }
};

// Helper function to format rate display
export const formatRateDisplay = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

// Helper function to get rates by unit
export const getRatesByUnit = (
  unit: "days" | "months" | "years"
): TermDepositRate[] => {
  return TERM_DEPOSIT_RATES.filter((rate) => rate.unit === unit);
};

// Helper function to find best rate
export const getBestRate = (): TermDepositRate => {
  return TERM_DEPOSIT_RATES.reduce((best, current) =>
    current.rate > best.rate ? current : best
  );
};

// Helper function to find rate by term length
export const getRateByTerm = (
  termLength: string,
  unit: "days" | "months" | "years"
): TermDepositRate | null => {
  return (
    TERM_DEPOSIT_RATES.find(
      (rate) => rate.term === termLength && rate.unit === unit
    ) || null
  );
};

// Helper function to find rate by term length (auto-detect unit)
export const findRateByTerm = (termLength: string): TermDepositRate | null => {
  // Try to find exact match first
  const exactMatch = TERM_DEPOSIT_RATES.find(
    (rate) => rate.term === termLength
  );
  if (exactMatch) return exactMatch;

  // If no exact match, try to find the closest match
  const numericTerm = parseFloat(termLength);
  if (isNaN(numericTerm)) return null;

  // Find the closest term by numeric value
  let closestRate: TermDepositRate | null = null;
  let minDifference = Infinity;

  TERM_DEPOSIT_RATES.forEach((rate) => {
    const rateNumeric = parseFloat(rate.term);
    const difference = Math.abs(numericTerm - rateNumeric);

    if (difference < minDifference) {
      minDifference = difference;
      closestRate = rate;
    }
  });

  return closestRate;
};
