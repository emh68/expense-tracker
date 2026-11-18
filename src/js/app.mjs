import { createIcons, House, List, ChartPie, ChartNoAxesColumn, Settings, Wallet, CalendarDays, Target, ReceiptText, Plus, } from "lucide";

async function loadSidebar() {
  const sidebar = document.querySelector("#sidebar");

  if (!sidebar) return;

  try {
    const response = await fetch("/partials/sidebar.html");

    if (!response.ok) {
      throw new Error("Unable to load sidebar");
    }

    sidebar.innerHTML = await response.text();

    // Find the current page.
    const currentPath = window.location.pathname
      .replace(/index\.html$/, "")
      .replace(/\/?$/, "/");

    // Highlight the active navigation link.
    sidebar.querySelectorAll(".nav-link").forEach((link) => {
      const linkPath = new URL(link.href).pathname;

      if (linkPath === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    // Replace icon placeholders with SVG icons.
    createIcons({ icons: { House, List, ChartPie, ChartNoAxesColumn, Settings, Wallet, CalendarDays, Target, ReceiptText, Plus, }, });
  } catch (error) {
    console.error("Sidebar error:", error);
  }
}

loadSidebar();