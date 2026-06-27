import { StatCard } from "../components/StatCard";
import { getAllProducts } from "../utils/format";

export function Dashboard({ menu, setActivePage }) {
  const products = getAllProducts(menu);
  const activeProducts = products.filter((product) => product.status === "active");
  const needsConfirmation = products.filter((product) => product.status === "needs_confirmation");
  const alcoholicProducts = products.filter((product) => product.isAlcoholic);
  const averageTicket = products.length
    ? Math.round(
        products.reduce((total, product) => total + (product.priceInCents || 0), 0) /
          products.filter((product) => product.priceInCents).length
      )
    : 0;

  const topCategories = menu.categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      total: category.products.length
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Dashboard</h1>
          <p>Resumo operacional do cardápio salvo na API.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setActivePage("produtos")}>
          Novo produto
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Produtos" value={products.length} helper="Itens cadastrados" />
        <StatCard label="Categorias" value={menu.categories.length} helper="Grupos do cardápio" />
        <StatCard label="Ativos" value={activeProducts.length} helper="Prontos para exibição" />
        <StatCard label="Pendentes" value={needsConfirmation.length} helper="Precisam de validação" />
        <StatCard label="+18" value={alcoholicProducts.length} helper="Bebidas alcoólicas" />
        <StatCard
          label="Ticket médio"
          value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
            averageTicket / 100
          )}
          helper="Baseado nos preços cadastrados"
        />
      </div>

      <div className="content-grid two-columns">
        <article className="panel">
          <div className="panel-header">
            <h2>Maiores categorias</h2>
            <span>{topCategories.length} listadas</span>
          </div>
          <div className="rank-list">
            {topCategories.map((category, index) => (
              <div className="rank-item" key={category.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.name}</strong>
                <em>{category.total} produtos</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Itens que precisam validar</h2>
            <span>{needsConfirmation.length} itens</span>
          </div>
          {needsConfirmation.length ? (
            <div className="compact-list">
              {needsConfirmation.slice(0, 8).map((product) => (
                <div key={product.id}>
                  <strong>{product.name}</strong>
                  <span>{product.categoryName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Nenhum item pendente no momento.</p>
          )}
        </article>
      </div>
    </section>
  );
}
