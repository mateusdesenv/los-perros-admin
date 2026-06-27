import { useMemo, useState } from "react";
import { adminApi } from "../services/api";
import { generateId, slugify } from "../utils/format";

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  displayOrder: 0,
  isActive: true
};

export function Categories({ menu, refreshMenu }) {
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const categories = useMemo(
    () => menu.categories.map((category) => ({ ...category, totalProducts: category.products.length })),
    [menu.categories]
  );

  function resetForm() {
    setForm(emptyCategory);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) return;

    const payload = {
      id: editingId || generateId(name, "categoria"),
      name,
      slug: form.slug.trim() || slugify(name),
      description: form.description.trim(),
      displayOrder: Number(form.displayOrder || 0),
      isActive: Boolean(form.isActive)
    };

    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
      } else {
        await adminApi.createCategory(payload);
      }

      await refreshMenu();
      setMessage({ type: "success", text: "Categoria salva na API." });
      resetForm();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao salvar categoria." });
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false
    });
  }

  async function handleDelete(categoryId) {
    const category = menu.categories.find((item) => item.id === categoryId);
    const message = `Excluir a categoria "${category.name}" e todos os ${category.products.length} produtos dela?`;

    if (!window.confirm(message)) return;

    try {
      await adminApi.deleteCategory(categoryId);
      await refreshMenu();
      setMessage({ type: "success", text: "Categoria excluída da API." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao excluir categoria." });
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Organização</p>
          <h1>Categorias</h1>
          <p>Gerencie os grupos usados para separar os produtos no cardápio.</p>
        </div>
      </div>
      {message ? <div className={`alert alert-${message.type}`}>{message.text}</div> : null}

      <div className="content-grid form-and-list">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>{editingId ? "Editar categoria" : "Nova categoria"}</h2>
          </div>

          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ex.: Bebidas geladas"
            />
          </label>

          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="Gerado automaticamente se ficar vazio"
            />
          </label>

          <label>
            Descrição
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Descrição opcional"
              rows={3}
            />
          </label>

          <div className="split-fields">
            <label>
              Ordem
              <input
                type="number"
                value={form.displayOrder}
                onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Ativa no site
            </label>
          </div>

          <div className="button-row">
            <button className="primary-button" type="submit">
              {editingId ? "Salvar alterações" : "Cadastrar categoria"}
            </button>
            {editingId ? (
              <button className="ghost-button" type="button" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        <article className="panel table-panel">
          <div className="panel-header">
            <h2>Categorias cadastradas</h2>
            <span>{categories.length} categorias</span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Produtos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.totalProducts}</td>
                    <td>{category.isActive === false ? "Inativa" : "Ativa"}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => handleEdit(category)}>
                          Editar
                        </button>
                        <button type="button" className="danger-text" onClick={() => handleDelete(category.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
