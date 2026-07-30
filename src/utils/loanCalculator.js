const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateLoanCost = ({ principal, annualRate, months }) => {
  const amount = Number(principal);
  const rate = Number(annualRate);
  const term = Number(months);

  if (
    !Number.isFinite(amount)
    || !Number.isFinite(rate)
    || !Number.isFinite(term)
    || amount <= 0
    || rate < 0
    || !Number.isInteger(term)
    || term <= 0
  ) {
    return null;
  }

  const monthlyRate = rate / 1200;
  const monthlyPayment = monthlyRate === 0
    ? amount / term
    : amount * monthlyRate * ((1 + monthlyRate) ** term)
      / (((1 + monthlyRate) ** term) - 1);
  const totalRepayable = monthlyPayment * term;

  return {
    monthlyPayment: roundCurrency(monthlyPayment),
    totalRepayable: roundCurrency(totalRepayable),
    totalInterest: roundCurrency(totalRepayable - amount),
  };
};
