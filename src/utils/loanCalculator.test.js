import { describe, expect, it } from "vitest";
import { calculateLoanCost } from "./loanCalculator.js";

describe("loan cost calculator", () => {
  it("calculates an illustrative reducing-balance payment", () => {
    expect(calculateLoanCost({
      principal: 100000,
      annualRate: 12,
      months: 12,
    })).toEqual({
      monthlyPayment: 8884.88,
      totalRepayable: 106618.55,
      totalInterest: 6618.55,
    });
  });

  it("handles a zero-rate illustration", () => {
    expect(calculateLoanCost({
      principal: "12000",
      annualRate: "0",
      months: "12",
    })).toEqual({
      monthlyPayment: 1000,
      totalRepayable: 12000,
      totalInterest: 0,
    });
  });

  it("rejects invalid, negative and fractional-term inputs", () => {
    expect(calculateLoanCost({ principal: 0, annualRate: 10, months: 12 })).toBeNull();
    expect(calculateLoanCost({ principal: 1000, annualRate: -1, months: 12 })).toBeNull();
    expect(calculateLoanCost({ principal: 1000, annualRate: 10, months: 1.5 })).toBeNull();
  });
});
