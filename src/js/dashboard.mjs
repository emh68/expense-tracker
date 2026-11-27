import { formatCurrency } from "./currency.mjs";
import { getAllExpenses, getBudgets, getCategories } from "./expenseData.mjs";

export function expensesForMonth(expenses, month) {
  return expenses.filter((expense) =>
    typeof expense.expenseDate === "string" &&
    expense.expenseDate.slice(0, 7) === month,
  );
}

export function spendingCents(expenses) {
  return expenses.reduce((total, expense) => total + expense.amountCents, 0);
}

export function spendingByCategory(expenses) {
  return expenses.reduce((totals, expense) => {
    const categoryId = expense.categoryId;
    totals[categoryId] = (totals[categoryId] || 0) + expense.amountCents;
    return totals;
  }, {});
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function makeTransactionRow(expense, categoryNames) {
  const row = document.createElement("div");
  row.className = "transaction-row";

  const details = document.createElement("div");
  const merchant = document.createElement("strong");
  merchant.textContent = expense.merchant;
  const category = document.createElement("small");
  category.textContent = `${categoryNames.get(expense.categoryId) || "Category"} · ${expense.expenseDate}`;
  details.append(merchant, category);

  const amount = document.createElement("span");
  amount.className = "transaction-amount";
  amount.textContent = formatCurrency(expense.amountCents);
  row.append(details, amount);
  return row;
}

function renderRecentTransactions(expenses, categoryNames) {
  const container = document.getElementById("recent-transactions");
  if (!container) return;
  container.replaceChildren();

  if (expenses.length === 0) {
    container.textContent = "No transactions this month.";
    return;
  }

  const recent = [...expenses]
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
    .slice(0, 5);
  recent.forEach((expense) => container.append(makeTransactionRow(expense, categoryNames)));
}

function renderBudgets(budgets, categoryNames, categoryTotals) {
  const container = document.getElementById("budget-progress");
  if (!container) return;
  container.replaceChildren();

  const categoryBudgets = budgets.filter((budget) => budget.categoryId !== null);
  if (categoryBudgets.length === 0) {
    container.textContent = "No category budgets configured yet.";
    return;
  }

  for (const budget of categoryBudgets) {
    const spent = categoryTotals[budget.categoryId] || 0;
    const row = document.createElement("div");
    row.className = "transaction-row";
    const label = document.createElement("span");
    label.textContent = categoryNames.get(budget.categoryId) || "Category";
    const amount = document.createElement("span");
    amount.textContent = `${formatCurrency(spent)} / ${formatCurrency(budget.amountCents)}`;
    row.append(label, amount);
    container.append(row);
  }
}

function renderDashboard(expenses, budgets, categories, month) {
  const monthly = expensesForMonth(expenses, month);
  const monthlyBudgets = budgets.filter((budget) => budget.month === month,);
  const spent = spendingCents(monthly);
  const overallBudget = monthlyBudgets.find((budget) => budget.categoryId === null,);
  const categoryNames = new Map(categories.map(({ id, name }) => [id, name]));
  const categoryTotals = spendingByCategory(monthly);

  setText("monthly-spending", formatCurrency(spent));
  setText("monthly-budget", overallBudget ? formatCurrency(overallBudget.amountCents) : "Not set");
  setText("remaining-budget", overallBudget ? formatCurrency(overallBudget.amountCents - spent) : "—");
  setText("transaction-count", String(monthly.length));

  renderRecentTransactions(monthly, categoryNames);
  renderBudgets(monthlyBudgets, categoryNames, categoryTotals);

  // Placeholder for Chart.js. This is future work needed before completion
  setText("category-chart", monthly.length ? "Category chart is not connected yet." : "No spending data this month.");
  setText("trends-chart", "Expense trends chart is not connected yet.");
}

async function loadDashboard() {
  const month = document.getElementById("month-picker")?.value;
  if (!month) return;

  try {
    const [expenses, budgets, categories] = await Promise.all([
      getAllExpenses(),
      getBudgets(month),
      getCategories(),
    ]);

    if (![expenses, budgets, categories].every(Array.isArray)) {
      throw new Error("The API must return arrays for expenses, budgets and categories.");
    }

    renderDashboard(expenses, budgets, categories, month);
    } catch (error) {
    console.error("Unable to load dashboard:", error);

    setText("monthly-spending", "—");
    setText("monthly-budget", "Unavailable");
    setText("remaining-budget", "—");
    setText("transaction-count", "—");
    setText("category-chart", "Dashboard data is unavailable until the API is connected.");
    setText("trends-chart", "Dashboard data is unavailable until the API is connected.");
    setText("recent-transactions", "Unable to load transactions.");
    setText("budget-progress", "Unable to load budgets.");
  }
}

function initDashboard() {
  const monthPicker = document.getElementById("month-picker");
  if (!monthPicker) return;
  const today = new Date();
  monthPicker.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  monthPicker.addEventListener("change", loadDashboard);
  loadDashboard();
}

if (typeof document !== "undefined") initDashboard();
