export function slugify(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateId(value, fallback = "item") {
  const base = slugify(value) || fallback;
  return `${base}-${Date.now().toString(36)}`;
}

export function centsToCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) / 100);
}

export function currencyToCents(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value)
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;

  return Math.round(parsed * 100);
}

export function getAllProducts(menu) {
  return menu.categories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
}

export function normalizeImportedMenu(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("JSON inválido: o conteúdo precisa ser um objeto.");
  }

  if (!payload.establishment || !Array.isArray(payload.categories)) {
    throw new Error("JSON inválido: esperado o formato { establishment, categories }.");
  }

  return {
    establishment: {
      name: payload.establishment.name || "Los Perros Market",
      type: payload.establishment.type || "Conveniência Delivery",
      currency: payload.establishment.currency || "BRL",
      whatsapp: payload.establishment.whatsapp || "",
      deliveryNote: payload.establishment.deliveryNote || "",
      openingHours: payload.establishment.openingHours || "",
      instagram: payload.establishment.instagram || "",
      ifoodUrl: payload.establishment.ifoodUrl || ""
    },
    categories: payload.categories.map((category) => ({
      id: category.id || slugify(category.name),
      name: category.name || "Categoria sem nome",
      slug: category.slug || slugify(category.name),
      description: category.description || "",
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
      products: Array.isArray(category.products)
        ? category.products.map((product) => {
            const priceInCents =
              product.priceInCents ?? currencyToCents(product.priceFormatted);

            return {
              id: product.id || generateId(product.name, "produto"),
              name: product.name || "Produto sem nome",
              description: product.description || null,
              volume: product.volume || null,
              priceInCents,
              priceFormatted: product.priceFormatted || centsToCurrency(priceInCents) || null,
              isAlcoholic: Boolean(product.isAlcoholic),
              ageRestriction18: Boolean(product.ageRestriction18),
              image: product.image || null,
              status: product.status || "active",
              isFeatured: Boolean(product.isFeatured),
              displayOrder: product.displayOrder || 0
            };
          })
        : []
    }))
  };
}
