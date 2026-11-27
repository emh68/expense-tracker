
const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (HTTP ${response.status}).`;

    try {
      const error = await response.json();

      if (typeof error.error === "string") {
        message = error.error;
      } else if (typeof error.message === "string") {
        message = error.message;
      }
    } catch {
      // Use the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined;
  return response.json();
}

export async function getAllExpenses() {
  return apiRequest("/expenses");
}

export async function addExpense(expense) {
  return apiRequest("/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
}

export async function updateExpense(expense) {
  if (!expense?.id) throw new Error("An expense ID is required.");

  const { id, ...changes } = expense;

  return apiRequest(`/expenses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export async function deleteExpense(id) {
  if (!id) throw new Error("An expense ID is required.");

  return apiRequest(`/expenses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getBudgets(month) {
  const search = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiRequest(`/budgets${search}`);
}

export async function getCategories() {
  return apiRequest("/categories");
}
