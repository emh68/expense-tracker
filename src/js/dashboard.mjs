import { formatCurrency } from "./currency.mjs";
import { getAllExpenses, getBudgets, getCategories } from "./expenseData.mjs";
import Chart from "chart.js/auto";
import { getCategoryColor } from "./categoryColors.mjs";

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

let categoryChart = null;
export function renderCategoryChart(expenses, categories) {
  const container = document.getElementById("category-chart");
  if (!container) return;

  if (categoryChart) categoryChart.destroy();
  categoryChart = null;
  container.replaceChildren();

  const totals = spendingByCategory(expenses);
  const entries = Object.entries(totals).filter(([, cents]) => cents > 0);

  if (entries.length === 0) {
    container.textContent = "No spending data this month.";
    return;
  }

  const totalCents = entries.reduce((total, [, cents]) => total + cents, 0);
  const names = new Map(categories.map((category) => [
    String(category.id ?? category._id), category.name,
  ]));

  const chartArea = document.createElement("div");
  chartArea.className = "category-chart-visual";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Spending by category");
  chartArea.append(canvas);

  const legend = document.createElement("div");
  legend.className = "category-legend";

  for (const [id, cents] of entries) {
    const row = document.createElement("div");
    row.className = "category-legend-row";

    const swatch = document.createElement("span");
    swatch.className = "category-color-swatch";
    swatch.style.backgroundColor = getCategoryColor(id, categories);

    const name = document.createElement("span");
    name.className = "category-legend-name";
    name.textContent = names.get(id) || "Category unavailable";

    const percentage = document.createElement("span");
    percentage.className = "category-legend-percent";
    percentage.textContent = `${((cents / totalCents) * 100).toFixed(1)}%`;

    const amount = document.createElement("strong");
    amount.className = "category-legend-amount";
    amount.textContent = formatCurrency(cents);

    row.append(swatch, name, percentage, amount);
    legend.append(row);
  }

  container.append(chartArea, legend);

  const centerText = {
    id: "categoryCenterText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 18px Arial";
      ctx.fillText(formatCurrency(totalCents), x, y - 12);
      ctx.font = "12px Arial";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Total", x, y + 12);
      ctx.restore();
    },
  };

  categoryChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: entries.map(([id]) => names.get(id) || "Category unavailable"),
      datasets: [{
        data: entries.map(([, cents]) => cents),
        backgroundColor: entries.map(([id]) => getCategoryColor(id, categories)),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const percent = ((context.parsed / totalCents) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(context.parsed)} (${percent}%)`;
            },
          },
        },
      },
    },
    plugins: [centerText],
  });
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
  amount.textContent = `-${formatCurrency(expense.amountCents)}`;
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

export function renderBudgets(budgets, categoryNames, categoryTotals, categories) {
  const container = document.getElementById("budget-progress");
  if (!container) return;
  container.replaceChildren();

  const categoryBudgets = budgets.filter((budget) => budget.categoryId != null);

  if (categoryBudgets.length === 0) {
    container.textContent = "No category budgets configured yet.";
    return;
  }

  for (const budget of categoryBudgets) {
    const categoryId = String(budget.categoryId);
    const spent = categoryTotals[categoryId] || 0;
    const percent = budget.amountCents > 0
      ? Math.round((spent / budget.amountCents) * 100)
      : 0;

    const row = document.createElement("div");
    row.className = "budget-row";

    const details = document.createElement("div");
    details.className = "budget-details";

    const label = document.createElement("strong");
    label.textContent = categoryNames.get(categoryId) || "Category";

    const amount = document.createElement("span");

    if (spent > budget.amountCents) {
      const spentAmount = document.createElement("span");
      spentAmount.className = "over-budget";
      spentAmount.textContent = formatCurrency(spent);
      amount.append(spentAmount, ` / ${formatCurrency(budget.amountCents)}`);
    } else {
      amount.textContent = `${formatCurrency(spent)} / ${formatCurrency(budget.amountCents)}`;
    }

    details.append(label, amount);

    const track = document.createElement("div");
    track.className = "budget-track";

    const fill = document.createElement("div");
    fill.className = "budget-fill";
    fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    fill.style.backgroundColor = getCategoryColor(categoryId, categories);

    track.append(fill);

    const percentage = document.createElement("small");
    percentage.className = "budget-percentage";
    percentage.textContent = `${percent}% used`;
    if (spent > budget.amountCents) {
      percentage.classList.add("over-budget");
    }

    row.append(details, track, percentage);
    container.append(row);
  }
}


function renderDashboard(expenses, budgets, categories, month) {
  const monthly = expensesForMonth(expenses, month);
  const monthlyBudgets = budgets.filter((budget) => budget.month === month);
  const spent = spendingCents(monthly);
  const overallBudget = monthlyBudgets.find((budget) => budget.categoryId === null);
  const categoryNames = new Map(categories.map(({ id, _id, name }) => [String(id ?? _id), name]));
  const categoryTotals = spendingByCategory(monthly);

  setText("monthly-spending", formatCurrency(spent));
  setText("monthly-budget", overallBudget ? formatCurrency(overallBudget.amountCents) : "Not set");
  setText("remaining-budget", overallBudget ? formatCurrency(overallBudget.amountCents - spent) : "—");
  setText("transaction-count", String(monthly.length));

  renderRecentTransactions(monthly, categoryNames);
  renderBudgets(monthlyBudgets, categoryNames, categoryTotals, categories);

  renderCategoryChart(monthly, categories);
  setText("trends-chart", "Expense trends chart is not connected yet.");
}

async function loadDashboard() {
  const month = document.getElementById("month-picker")?.value;
  if (!month) return;

  try {
    const [expensesResult, budgetsResult, categoriesResult] =
      await Promise.allSettled([
        getAllExpenses(),
        getBudgets(month),
        getCategories(),
      ]);

    if (expensesResult.status !== "fulfilled" ||
        !Array.isArray(expensesResult.value)) {
      throw new Error("Unable to load expenses.");
    }

    const budgetsLoaded = budgetsResult.status === "fulfilled" &&
      Array.isArray(budgetsResult.value);

    const categoriesLoaded = categoriesResult.status === "fulfilled" &&
      Array.isArray(categoriesResult.value);

    const expenses = expensesResult.value;
    const budgets = budgetsLoaded ? budgetsResult.value : [];
    const categories = categoriesLoaded ? categoriesResult.value : [];

    renderDashboard(expenses, budgets, categories, month);

    if (!budgetsLoaded) {
      setText("monthly-budget", "Unavailable");
      setText("remaining-budget", "—");
      setText("budget-progress", "Budget data is not available yet.");
    }
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
