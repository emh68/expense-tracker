async function loadSidebar() {
  const sidebar = document.querySelector("#sidebar");

  if (!sidebar) return;

  try {
    const response = await fetch("/partials/sidebar.html");

    if (!response.ok) {
      throw new Error("Unable to load sidebar");
    }

    sidebar.innerHTML = await response.text();
  } catch (error) {
    console.error("Sidebar error:", error);
  }
}

loadSidebar();