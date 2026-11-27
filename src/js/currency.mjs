export function dollarsToCents(value) {
  if (value === "" || value === null || value === undefined) {
    throw new Error("An amount is required.");
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid dollar amount.");
  }

  const cents = Math.round(amount * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("Amount is too large.");
  }

  return cents;
}

export function formatCurrency(amountCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}