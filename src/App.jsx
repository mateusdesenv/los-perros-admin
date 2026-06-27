import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { Products } from "./pages/Products";
import { Settings } from "./pages/Settings";
import { ImportExport } from "./pages/ImportExport";
import { initialMenu } from "./data/initialMenu";
import { adminApi } from "./services/api";
import "./styles.css";

const pageTitles = {
  dashboard: "Dashboard",
  categorias: "Categorias",
  produtos: "Produtos",
  configuracoes: "Configurações",
  "importar-exportar": "Importar/Exportar"
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [menu, setMenu] = useState(initialMenu);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    refreshMenu();
  }, []);

  async function refreshMenu() {
    setIsLoading(true);
    setError("");

    try {
      setMenu(await adminApi.getMenu());
    } catch (error) {
      setError(error.message || "Não foi possível carregar os dados da API.");
    } finally {
      setIsLoading(false);
    }
  }

  const currentPage = useMemo(() => {
    const props = { menu, setMenu, setActivePage, refreshMenu };

    switch (activePage) {
      case "categorias":
        return <Categories {...props} />;
      case "produtos":
        return <Products {...props} />;
      case "configuracoes":
        return <Settings {...props} />;
      case "importar-exportar":
        return <ImportExport {...props} />;
      case "dashboard":
      default:
        return <Dashboard {...props} />;
    }
  }, [activePage, menu]);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onChangePage={setActivePage} establishment={menu.establishment} />

      <main className="main-content">
        <header className="topbar">
          <div>
            <span>Admin</span>
            <strong>{pageTitles[activePage]}</strong>
          </div>
          <div className="topbar-badge">React + API</div>
        </header>

        {isLoading ? <div className="alert alert-success">Carregando dados da API...</div> : null}
        {error ? (
          <div className="alert alert-error">
            {error} <button type="button" onClick={refreshMenu}>Tentar novamente</button>
          </div>
        ) : null}
        {currentPage}
      </main>
    </div>
  );
}

export default App;
