
export function getCategoryColor(categoryId, categories) {
  const category = categories.find((item) =>
    String(item.id ?? item._id) === String(categoryId)
  );

  return category?.color || "#64748b";
}
