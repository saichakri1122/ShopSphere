function validateCreateCategoryInput(data) {
  const { name, slug } = data;

  if (!name || !name.trim()) {
    return "Category name is required";
  }

  if (!slug || !slug.trim()) {
    return "Category slug is required";
  }

  if (name.trim().length > 100) {
    return "Category name cannot exceed 100 characters";
  }

  if (slug.trim().length > 120) {
    return "Category slug cannot exceed 120 characters";
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugRegex.test(slug.trim())) {
    return "Slug must contain only lowercase letters, numbers, and hyphens";
  }

  return null;
}

function validateUpdateCategoryInput(data) {
  const { name, slug } = data;

  if (name !== undefined && !name.trim()) {
    return "Category name cannot be empty";
  }

  if (slug !== undefined) {
    if (!slug.trim()) {
      return "Category slug cannot be empty";
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugRegex.test(slug.trim())) {
      return "Slug must contain only lowercase letters, numbers, and hyphens";
    }
  }

  return null;
}

module.exports = {
  validateCreateCategoryInput,
  validateUpdateCategoryInput,
};