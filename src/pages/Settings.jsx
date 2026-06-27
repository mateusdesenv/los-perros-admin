import { useState } from "react";
import { adminApi } from "../services/api";

export function Settings({ menu, refreshMenu }) {
  const [form, setForm] = useState(menu.establishment);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      await adminApi.updateStoreConfig(form);
      await refreshMenu();
      setSaved(true);
    } catch (error) {
      setError(error.message || "Erro ao salvar configurações.");
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dados gerais</p>
          <h1>Configurações</h1>
          <p>Dados básicos do estabelecimento usados pela API e pelo site público.</p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <form className="panel settings-form" onSubmit={handleSubmit}>
        <div className="panel-header">
          <h2>Informações do estabelecimento</h2>
          {saved ? <span className="success-text">Salvo na API</span> : null}
        </div>

        <div className="split-fields">
          <label>
            Nome
            <input value={form.name || ""} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            Tipo
            <input value={form.type || ""} onChange={(event) => updateField("type", event.target.value)} />
          </label>
        </div>

        <div className="split-fields">
          <label>
            Moeda
            <input value={form.currency || "BRL"} onChange={(event) => updateField("currency", event.target.value)} />
          </label>
          <label>
            WhatsApp
            <input
              value={form.whatsapp || ""}
              onChange={(event) => updateField("whatsapp", event.target.value)}
              placeholder="Ex.: 48999999999"
            />
          </label>
        </div>

        <label>
          Observação de delivery
          <textarea
            rows={4}
            value={form.deliveryNote || ""}
            onChange={(event) => updateField("deliveryNote", event.target.value)}
            placeholder="Texto curto para exibir no site público."
          />
        </label>

        <div className="split-fields">
          <label>
            Horário
            <input
              value={form.openingHours || ""}
              onChange={(event) => updateField("openingHours", event.target.value)}
              placeholder="Ex.: Todos os dias, 10h às 23h"
            />
          </label>
          <label>
            Instagram
            <input
              value={form.instagram || ""}
              onChange={(event) => updateField("instagram", event.target.value)}
              placeholder="@losperros.market"
            />
          </label>
        </div>

        <label>
          Link iFood
          <input
            value={form.ifoodUrl || ""}
            onChange={(event) => updateField("ifoodUrl", event.target.value)}
            placeholder="https://..."
          />
        </label>

        <button className="primary-button" type="submit">
          Salvar configurações
        </button>
      </form>
    </section>
  );
}
