import { useMemo, useState } from "react";
import { adminApi } from "../services/api";
import { normalizeImportedMenu } from "../utils/format";

export function ImportExport({ menu, refreshMenu }) {
  const [importValue, setImportValue] = useState("");
  const [message, setMessage] = useState(null);

  const exportValue = useMemo(() => JSON.stringify(menu, null, 2), [menu]);

  function downloadJson() {
    const blob = new Blob([exportValue], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `los-perros-cardapio-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(exportValue);
    setMessage({ type: "success", text: "JSON copiado para a área de transferência." });
  }

  async function importJson() {
    try {
      const parsed = JSON.parse(importValue);
      const normalized = normalizeImportedMenu(parsed);

      await adminApi.updateStoreConfig(normalized.establishment);

      const currentCategoryIds = new Set(menu.categories.map((category) => category.id));
      const currentProductIds = new Set(
        menu.categories.flatMap((category) => category.products.map((product) => product.id))
      );

      for (const category of normalized.categories) {
        const payload = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          displayOrder: category.displayOrder || 0,
          isActive: category.isActive !== false
        };

        if (currentCategoryIds.has(category.id)) {
          await adminApi.updateCategory(category.id, payload);
        } else {
          await adminApi.createCategory(payload);
        }

        for (const product of category.products) {
          const productPayload = {
            ...product,
            categoryId: category.id,
            isFeatured: Boolean(product.isFeatured)
          };

          if (currentProductIds.has(product.id)) {
            await adminApi.updateProduct(product.id, productPayload);
          } else {
            await adminApi.createProduct(productPayload);
          }
        }
      }

      await refreshMenu();
      setImportValue("");
      setMessage({ type: "success", text: "JSON importado na API com sucesso." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Não foi possível importar o JSON." });
    }
  }

  async function reloadFromApi() {
    await refreshMenu();
    setMessage({ type: "success", text: "Dados recarregados da API." });
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Backup</p>
          <h1>Importar/Exportar</h1>
          <p>Use esta tela para baixar, copiar ou importar dados usando a API.</p>
        </div>
      </div>

      {message ? <div className={`alert alert-${message.type}`}>{message.text}</div> : null}

      <div className="content-grid two-columns">
        <article className="panel">
          <div className="panel-header">
            <h2>Exportar JSON</h2>
            <span>{menu.categories.length} categorias</span>
          </div>
          <textarea className="code-area" value={exportValue} readOnly rows={18} />
          <div className="button-row">
            <button className="primary-button" type="button" onClick={downloadJson}>
              Baixar JSON
            </button>
            <button className="ghost-button" type="button" onClick={copyJson}>
              Copiar JSON
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Importar JSON</h2>
            <span>Substitui os dados atuais</span>
          </div>
          <textarea
            className="code-area"
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
            placeholder="Cole aqui o JSON no formato { establishment, categories }"
            rows={18}
          />
          <div className="button-row">
            <button className="primary-button" type="button" onClick={importJson}>
              Importar JSON
            </button>
            <button className="ghost-button" type="button" onClick={reloadFromApi}>
              Recarregar API
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
