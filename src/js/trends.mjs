import Chart from "chart.js/auto";
import { formatCurrency } from "./currency.mjs";

let trendsChart = null;

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(date) {
  return dateKey(date).slice(0, 7);
}

function getBuckets(period, today) {
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const buckets = [];

  if (period === "week") {
    const monday = new Date(current);
    monday.setDate(current.getDate() - (current.getDay() + 6) % 7);

    for (const day = new Date(monday); day <= current; day.setDate(day.getDate() + 1)) {
      buckets.push({
        label: `${day.toLocaleDateString("en-US", { weekday: "short" })} ${day.getDate()}`,
        start: new Date(day),
        end: new Date(day),
      });
    }
  } else if (period === "month") {
    const first = new Date(current.getFullYear(), current.getMonth(), 1);

    for (const start = new Date(first); start <= current;) {
      const end = new Date(start);
      const daysToSunday = 6 - (start.getDay() + 6) % 7;
      end.setDate(start.getDate() + daysToSunday);
      if (end > current) end.setTime(current.getTime());

      buckets.push({
        label: start.getDate() === end.getDate()
          ? String(start.getDate())
          : `${start.getDate()}–${end.getDate()}`,
        start: new Date(start),
        end: new Date(end),
      });
      start.setDate(end.getDate() + 1);
    }
  } else {
    const count = ["3", "6", "9", "12"].includes(period) ? Number(period) : 6;

    for (let i = count - 1; i >= 0; i--) {
      const first = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const last = i === 0
        ? new Date(current)
        : new Date(first.getFullYear(), first.getMonth() + 1, 0);

      buckets.push({
        label: first.toLocaleDateString("en-US", { month: "short" }),
        start: first,
        end: last,
        monthly: true,
      });
    }
  }

  return buckets;
}

export function getTrendMonths(period, today = new Date()) {
  const buckets = getBuckets(period, today);
  const months = new Set();

  for (const bucket of buckets) {
    const first = new Date(bucket.start.getFullYear(), bucket.start.getMonth(), 1);
    const last = new Date(bucket.end.getFullYear(), bucket.end.getMonth(), 1);

    for (const date = new Date(first); date <= last; date.setMonth(date.getMonth() + 1)) {
      months.add(monthKey(date));
    }
  }

  return [...months];
}

function budgetForBucket(bucket, budgetsByMonth) {
  if (bucket.monthly) {
    const budgets = budgetsByMonth.get(monthKey(bucket.start));
    const overall = budgets?.find((budget) => budget.categoryId == null);
    return overall && Number.isFinite(overall.amountCents) ? overall.amountCents : null;
  }

  let total = 0;
  for (const day = new Date(bucket.start); day <= bucket.end; day.setDate(day.getDate() + 1)) {
    const budgets = budgetsByMonth.get(monthKey(day));
    const overall = budgets?.find((budget) => budget.categoryId == null);
    if (!overall || !Number.isFinite(overall.amountCents)) return null;

    const daysInMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
    total += overall.amountCents / daysInMonth;
  }

  return Math.round(total);
}

export function getTrendData(expenses, budgetsByMonth, period, today = new Date()) {
  const buckets = getBuckets(period, today);

  return {
    labels: buckets.map((bucket) => bucket.label),
    spending: buckets.map((bucket) => expenses.reduce((total, expense) => {
      const date = typeof expense.expenseDate === "string"
        ? expense.expenseDate.slice(0, 10)
        : "";
      return date >= dateKey(bucket.start) && date <= dateKey(bucket.end)
        ? total + expense.amountCents
        : total;
    }, 0)),
    budgets: buckets.map((bucket) => budgetForBucket(bucket, budgetsByMonth)),
  };
}


export function renderTrendsChart(expenses, budgetsByMonth, period) {
  const container = document.getElementById("trends-chart");
  if (!container) return;

  if (trendsChart) trendsChart.destroy();
  trendsChart = null;
  container.replaceChildren();
  const styles = getComputedStyle(document.documentElement);
  const spendingColor = styles.getPropertyValue("--trend-spending").trim();
  const budgetColor = styles.getPropertyValue("--trend-budget").trim();
  const whiteColor = styles.getPropertyValue("--white").trim();
  const fontFamily = getComputedStyle(document.body).fontFamily;  

  const data = getTrendData(expenses, budgetsByMonth, period);
  const hasSpending = data.spending.some((cents) => cents > 0);
  const hasBudget = data.budgets.some((cents) => cents !== null);
  const budgetLabel = period === "week" || period === "month"
  ? "Budget Pace"
  : "Budget";

  if (!hasSpending && !hasBudget) {
    container.textContent = "No recorded transactions for this period.";
    return;
  }

  const chartArea = document.createElement("div");
  chartArea.className = "trends-chart-visual";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Spending and budget trends");
  chartArea.append(canvas);

  const legend = document.createElement("div");
  legend.className = "trends-legend";

  const spendingLegend = document.createElement("span");
  spendingLegend.className = "trends-legend-item";

  const spendingSwatch = document.createElement("span");
  spendingSwatch.className = "trends-legend-spending";

  spendingLegend.append(spendingSwatch, "Spending");
  legend.append(spendingLegend);

  if (hasBudget) {
    const budgetLegend = document.createElement("span");
    budgetLegend.className = "trends-legend-item";

    const budgetSymbol = document.createElement("span");
    budgetSymbol.className = "trends-legend-line";

    budgetLegend.append(budgetSymbol, budgetLabel);
    legend.append(budgetLegend);
  }

  container.append(chartArea, legend);

  const datasets = [{
    label: "Spending",
    data: data.spending.map((cents) => cents / 100),
    borderColor: spendingColor,
    backgroundColor: spendingColor,
    borderWidth: 2.5,
    pointStyle: "rectRounded",
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: spendingColor,
    pointBorderColor: spendingColor,
    tension: 0,
  }];

  if (hasBudget) {
    datasets.push({
      label: budgetLabel,
      data: data.budgets.map((cents) =>
        cents === null ? null : cents / 100
      ),
      borderColor: budgetColor,
      backgroundColor: budgetColor,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: whiteColor,
      pointBorderColor: budgetColor,
      pointBorderWidth: 2,
      spanGaps: false,
      tension: 0,
    });
  }

  const spendingLabels = {
    id: "spendingLabels",

    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      const points = chart.getDatasetMeta(0).data;
      const showAll = data.labels.length <= 6 && chartArea.width >= 520;

      ctx.save();
      ctx.font = `600 11px ${fontFamily}`;
      ctx.fillStyle = spendingColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      points.forEach((point, index) => {
        if (!showAll && index !== points.length - 1) return;
        if (data.spending[index] === 0) return;

        const label = formatCurrency(data.spending[index]);
        const halfWidth = ctx.measureText(label).width / 2;

        const x = Math.max(
          chartArea.left + halfWidth,
          Math.min(point.x, chartArea.right - halfWidth)
        );

        const y = Math.max(chartArea.top + 12, point.y - 9);
        ctx.fillText(label, x, y);
      });

      ctx.restore();
    },
  };

  trendsChart = new Chart(canvas, {
    type: "line",
    data: { labels: data.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 20 } },
      interaction: { mode: "index", intersect: false },

      plugins: {
        legend: { display: false },

        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${formatCurrency(Math.round(context.parsed.y * 100))}`,
          },
        },
      },

      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) =>
              `$${Number(value).toLocaleString("en-US")}`,
          },
        },
      },
    },
    plugins: [spendingLabels],
  });
}