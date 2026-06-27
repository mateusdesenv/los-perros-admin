import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../services/api";
import { centsToCurrency, currencyToCents, generateId, getAllProducts } from "../utils/format";

const emptyProduct = {
  id: null,
  categoryId: "",
  name: "",
  description: "",
  volume: "",
  priceFormatted: "",
  image: "",
  isAlcoholic: false,
  ageRestriction18: false,
  status: "active",
  isFeatured: false
};

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  needs_confirmation: "Validar"
};

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export function Products({ menu, refreshMenu }) {
  const [form, setForm] = useState({ ...emptyProduct, categoryId: menu.categories[0]?.id || "" });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", categoryId: "all", status: "all" });
  const [message, setMessage] = useState(null);

  const products = useMemo(() => getAllProducts(menu), [menu]);

  useEffect(() => {
    if (!form.categoryId && menu.categories[0]?.id) {
      setForm((current) => ({ ...current, categoryId: menu.categories[0].id }));
    }
  }, [form.categoryId, menu.categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = filters.search.toLowerCase().trim();
      const matchesSearch = search
        ? [product.name, product.description, product.volume, product.categoryName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search)
        : true;

      const matchesCategory = filters.categoryId === "all" || product.categoryId === filters.categoryId;
      const matchesStatus = filters.status === "all" || product.status === filters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, filters]);

  function resetForm() {
    setForm({ ...emptyProduct, categoryId: menu.categories[0]?.id || "" });
    setEditingId(null);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "isAlcoholic" && value === true) {
        next.ageRestriction18 = true;
      }

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const categoryId = form.categoryId;

    if (!name || !categoryId) return;

    const priceInCents = currencyToCents(form.priceFormatted);
    const payload = {
      id: editingId || generateId(name, "produto"),
      name,
      description: form.description.trim() || null,
      volume: form.volume.trim() || null,
      priceInCents,
      priceFormatted: priceInCents === null ? null : centsToCurrency(priceInCents),
      image: form.image || null,
      isAlcoholic: Boolean(form.isAlcoholic),
      ageRestriction18: Boolean(form.ageRestriction18 || form.isAlcoholic),
      status: form.status,
      isFeatured: Boolean(form.isFeatured)
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, { ...payload, categoryId });
      } else {
        await adminApi.createProduct({ ...payload, categoryId });
      }

      await refreshMenu();
      setMessage({ type: "success", text: "Produto salvo na API." });
      closeModal();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao salvar produto." });
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name || "",
      description: product.description || "",
      volume: product.volume || "",
      priceFormatted: product.priceFormatted || centsToCurrency(product.priceInCents),
      image: product.image || "",
      isAlcoholic: Boolean(product.isAlcoholic),
      ageRestriction18: Boolean(product.ageRestriction18),
      status: product.status || "active",
      isFeatured: Boolean(product.isFeatured)
    });
    setIsModalOpen(true);
  }

  async function handleDelete(productId) {
    if (!window.confirm("Excluir este produto?")) return;

    try {
      await adminApi.deleteProduct(productId);
      await refreshMenu();
      if (editingId === productId) resetForm();
      setMessage({ type: "success", text: "Produto excluído da API." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao excluir produto." });
    }
  }

  async function handleDuplicate(product) {
    const duplicated = {
      ...product,
      id: generateId(product.name, "produto"),
      name: `${product.name} - cópia`
    };

    try {
      await adminApi.createProduct(duplicated);
      await refreshMenu();
      setMessage({ type: "success", text: "Produto duplicado na API." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao duplicar produto." });
    }
  }

  async function toggleProduct(product, field) {
    try {
      await adminApi.updateProduct(product.id, { ...product, [field]: !product[field] });
      await refreshMenu();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erro ao atualizar produto." });
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Produtos</h1>
          <p>Gerencie os produtos persistidos na API.</p>
        </div>
        <button className="primary-button" type="button" onClick={openCreateModal}>
          Novo produto
        </button>
      </div>
      {message ? <div className={`alert alert-${message.type}`}>{message.text}</div> : null}

      <div className="content-grid products-layout">
        <article className="panel table-panel">
          <div className="panel-header stacked-header">
            <div>
              <h2>Produtos cadastrados</h2>
              <span>{filteredProducts.length} produtos encontrados</span>
            </div>
            <ProductFilters filters={filters} categories={menu.categories} onChange={setFilters} />
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onToggleFeatured={(item) => toggleProduct(item, "isFeatured")}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {!filteredProducts.length ? <p className="empty-state">Nenhum produto encontrado.</p> : null}
        </article>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        mode={editingId ? "edit" : "create"}
        form={form}
        categories={menu.categories}
        onClose={closeModal}
        onCancel={closeModal}
        onChange={updateField}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function ProductFilters({ filters, categories, onChange }) {
  return (
    <div className="filters-row">
      <input
        value={filters.search}
        onChange={(event) => onChange((current) => ({ ...current, search: event.target.value }))}
        placeholder="Buscar produto..."
      />
      <select
        value={filters.categoryId}
        onChange={(event) => onChange((current) => ({ ...current, categoryId: event.target.value }))}
      >
        <option value="all">Todas categorias</option>
        {categories.map((category) => (
          <option value={category.id} key={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(event) => onChange((current) => ({ ...current, status: event.target.value }))}
      >
        <option value="all">Todos status</option>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
        <option value="needs_confirmation">Precisa confirmar</option>
      </select>
    </div>
  );
}

function ProductCard({ product, onEdit, onDuplicate, onToggleFeatured, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = product.image && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  return (
    <article className="product-card">
      <div className="product-image">
        {hasImage ? <img src={product.image} alt={product.name} onError={() => setImageError(true)} /> : <span>Sem imagem</span>}
      </div>
      <div className="product-content">
        <div className="product-title-row">
          <strong>{product.name}</strong>
          <span className={`status-pill status-${product.status || "active"}`}>
            {statusLabels[product.status] || product.status}
          </span>
          {product.isFeatured ? <span className="status-pill status-active">Destaque</span> : null}
        </div>
        <p>{product.description || "Sem descrição"}</p>
        <div className="product-meta">
          <span>{product.categoryName}</span>
          {product.volume ? <span>{product.volume}</span> : null}
          {product.ageRestriction18 ? <span>+18</span> : null}
        </div>
        <div className="product-footer">
          <strong>{product.priceFormatted || "Preço pendente"}</strong>
          <div className="table-actions">
            <button type="button" onClick={() => onEdit(product)}>
              Editar
            </button>
            <button type="button" onClick={() => onDuplicate(product)}>
              Duplicar
            </button>
            <button type="button" onClick={() => onToggleFeatured(product)}>
              {product.isFeatured ? "Remover destaque" : "Destacar"}
            </button>
            <button type="button" className="danger-text" onClick={() => onDelete(product.id)}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductFormModal({ isOpen, mode, form, categories, onClose, onCancel, onChange, onSubmit }) {
  if (!isOpen) return null;

  const title = mode === "edit" ? "Editar produto" : "Novo produto";
  const submitLabel = mode === "edit" ? "Salvar produto" : "Cadastrar produto";

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-panel product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-header">
          <h2 id="product-modal-title">{title}</h2>
          <button className="modal-close-button" type="button" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <form className="product-form" onSubmit={onSubmit}>
          <label>
            Categoria
            <select value={form.categoryId} onChange={(event) => onChange("categoryId", event.target.value)}>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nome do produto
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Ex.: Coca Cola 2L"
            />
          </label>

          <label>
            Descrição
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Descrição curta do produto"
              rows={3}
            />
          </label>

          <div className="split-fields">
            <label>
              Volume
              <input
                value={form.volume}
                onChange={(event) => onChange("volume", event.target.value)}
                placeholder="750ml, 1L..."
              />
            </label>
            <label>
              Preço
              <input
                value={form.priceFormatted}
                onChange={(event) => onChange("priceFormatted", event.target.value)}
                placeholder="R$ 10,00"
              />
            </label>
          </div>

          <ImageDropzone value={form.image} onChange={(value) => onChange("image", value)} />

          <label>
            Status
            <select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="needs_confirmation">Precisa confirmar</option>
            </select>
          </label>

          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isAlcoholic}
                onChange={(event) => onChange("isAlcoholic", event.target.checked)}
              />
              Alcoólico
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.ageRestriction18}
                onChange={(event) => onChange("ageRestriction18", event.target.checked)}
              />
              +18
            </label>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => onChange("isFeatured", event.target.checked)}
            />
            Destaque na home
          </label>

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageDropzone({ value, onChange, maxSizeMB = 1 }) {
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const inputId = "product-image-upload";

  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  function validateAndReadFile(file) {
    setError("");

    if (!file) return;

    if (!acceptedImageTypes.includes(file.type)) {
      setError("Use uma imagem JPEG, PNG ou WEBP.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`A imagem deve ter no máximo ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.onerror = () => {
      setError("Não foi possível ler a imagem selecionada.");
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    validateAndReadFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="image-dropzone-field">
      <span>Imagem do produto</span>
      <label
        className={`image-dropzone ${isDragging ? "is-dragging" : ""}`}
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          accept={acceptedImageTypes.join(",")}
          onChange={(event) => {
            validateAndReadFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {value && !previewError ? (
          <img src={value} alt="Preview do produto" onError={() => setPreviewError(true)} />
        ) : (
          <div>
            <strong>Arraste uma imagem ou clique para selecionar</strong>
            <small>JPEG, PNG ou WEBP até {maxSizeMB}MB.</small>
          </div>
        )}
      </label>
      {error ? <small className="field-error">{error}</small> : null}
      {value ? (
        <button className="ghost-button image-remove-button" type="button" onClick={() => onChange(null)}>
          Remover imagem
        </button>
      ) : null}
    </div>
  );
}
