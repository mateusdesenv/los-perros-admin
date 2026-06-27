const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Não foi possível concluir a operação.");
  }

  return data;
}

export const adminApi = {
  getMenu() {
    return request("/admin/menu");
  },
  createCategory(payload) {
    return request("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
  },
  updateCategory(id, payload) {
    return request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteCategory(id) {
    return request(`/admin/categories/${id}`, { method: "DELETE" });
  },
  createProduct(payload) {
    return request("/admin/products", { method: "POST", body: JSON.stringify(payload) });
  },
  updateProduct(id, payload) {
    return request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteProduct(id) {
    return request(`/admin/products/${id}`, { method: "DELETE" });
  },
  updateStoreConfig(payload) {
    return request("/admin/store-config", { method: "PUT", body: JSON.stringify(payload) });
  }
};
