const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "categorias", label: "Categorias", icon: "🗂️" },
  { id: "produtos", label: "Produtos", icon: "🛒" },
  { id: "configuracoes", label: "Configurações", icon: "⚙️" },
  { id: "importar-exportar", label: "Importar/Exportar", icon: "↕️" }
];

export function Sidebar({ activePage, onChangePage, establishment }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">LP</div>
        <div>
          <strong>{establishment.name}</strong>
          <span>{establishment.type}</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activePage === item.id ? "nav-item active" : "nav-item"}
            onClick={() => onChangePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Dados locais</span>
        <strong>localStorage</strong>
      </div>
    </aside>
  );
}
