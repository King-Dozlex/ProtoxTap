import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { activateCard, assignCard, createCard, deactivateCard, deleteCard, getBusinesses, getCards, type Business, type Card } from "../services/api";
function dateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<Card | null>(null);
  const [cardCode, setCardCode] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [cardList, businessList] = await Promise.all([getCards(), getBusinesses()]);
      setCards(cardList);
      setBusinesses(businessList);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function openAssign(card: Card) {
    setAssigning(card);
    setBusinessId(card.businessId ? String(card.businessId) : "");
    setError("");
    setNotice("");
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createCard(cardCode.trim());
      setCreating(false);
      setCardCode("");
      setNotice("Card created as unassigned.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create card.");
    } finally {
      setSaving(false);
    }
  }

  async function submitAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assigning) return;
    setSaving(true);
    setError("");
    try {
      await assignCard(assigning.id, {businessId: Number(businessId),});
      setAssigning(null);
      setNotice(`${assigning.cardCode} assigned and remains inactive.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to assign card.");
    } finally {
      setSaving(false);
    }
  }

  async function runAction(card: Card, action: "activate" | "deactivate") {
    setWorkingId(card.id);
    setError("");
    setNotice("");
    try {
      if (action === "activate") await activateCard(card.id);
      else await deactivateCard(card.id);
      setNotice(`${card.cardCode} ${action === "activate" ? "activated" : "deactivated"}.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Unable to ${action} card.`);
    } finally {
      setWorkingId(null);
    }
  }

  async function runDelete(card: Card) {
    const confirmed = window.confirm(
      `Delete ${card.cardCode}?\n\nThis permanently removes the card from ProtoxTap.`
    );

    if (!confirmed) return;

    setWorkingId(card.id);
    setError("");
    setNotice("");

    try {
      await deleteCard(card.id);

      setNotice(`${card.cardCode} deleted.`);
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to delete card."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">CARD INVENTORY</span><h1>Cards</h1><p>Assign, activate, and manage each review card.</p></div>
        <button className="button button-primary" onClick={() => { setCreating(true); setError(""); setNotice(""); }}>+ <span>Create card</span></button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      <div className="card-summary-strip">
        {(["unassigned", "inactive", "active"] as const).map((status) => <div key={status}><StatusBadge status={status} /><strong>{cards.filter((card) => card.status === status).length}</strong></div>)}
      </div>
      <section className="data-section card-inventory">
        <div className="data-section-head"><span>{cards.length} {cards.length === 1 ? "card" : "cards"}</span><span>Inventory</span></div>
        {loading ? <div className="page-state">Loading cards...</div> : cards.length === 0 ? <div className="empty-state"><span className="empty-mark">C</span><h2>No cards yet</h2><p>Create a card to start the assignment workflow.</p><button className="button button-secondary" onClick={() => setCreating(true)}>Create your first card</button></div> : <div className="card-list">{cards.map((card) => <article className="card-row" key={card.id}>
          <div className="card-identity"><span className="eyebrow">CARD CODE</span><strong>{card.cardCode}</strong><StatusBadge status={card.status} /></div>
          <div className="card-meta"><div><span>Business</span><strong>{card.businessName || "Not assigned"}</strong></div><div><span>Google review URL</span>{card.redirectUrl ? <a href={card.redirectUrl} target="_blank" rel="noreferrer">Open link <span aria-hidden="true">&gt;</span></a> : <strong className="muted">Not set</strong>}</div><div><span>Created</span><strong>{dateLabel(card.createdAt)}</strong></div><div><span>Activated</span><strong>{dateLabel(card.activatedAt)}</strong></div><div><span>Deactivated</span><strong>{dateLabel(card.deactivatedAt)}</strong></div></div>
          <div className="card-actions"><span className="eyebrow">ACTIONS</span><div className="row-actions">
            {card.status === "unassigned" && <button className="button button-secondary button-small" onClick={() => openAssign(card)}>Assign</button>}
            {card.status === "inactive" && <><button className="button button-primary button-small" onClick={() => void runAction(card, "activate")} disabled={workingId === card.id}>{workingId === card.id ? "Working..." : "Activate"}</button><button className="button button-quiet button-small" onClick={() => openAssign(card)}>Reassign</button></>}
            {card.status === "active" && <button className="button button-danger-quiet button-small" onClick={() => void runAction(card, "deactivate")} disabled={workingId === card.id}>{workingId === card.id ? "Working..." : "Deactivate"}</button>}

{card.status !== "active" && (
  <button
    className="button button-danger-quiet button-small"
    onClick={() => void runDelete(card)}
    disabled={workingId === card.id}
  >
    {workingId === card.id ? "Deleting..." : "Delete"}
  </button>
)}
          </div></div>
        </article>)}</div>}
      </section>

      {creating && <Modal title="Create card" onClose={() => !saving && setCreating(false)}>
        <p className="modal-copy">New cards start unassigned. Assign a business to generate the Google review redirect automatically.</p>
        <form className="form-stack" onSubmit={submitCreate}>
          <label className="field"><span>Card code</span><input value={cardCode} onChange={(event) => setCardCode(event.target.value)} placeholder="PT-0001" required autoFocus /></label>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setCreating(false)} disabled={saving}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Creating..." : "Create unassigned card"}</button></div>
        </form>
      </Modal>}

      {assigning && <Modal title={assigning.status === "inactive" ? "Reassign card" : "Assign card"} onClose={() => !saving && setAssigning(null)}>
        <p className="modal-copy"><strong>{assigning.cardCode}</strong> will remain inactive after assignment.</p>
        <form className="form-stack" onSubmit={submitAssign}>
          <label className="field"><span>Business</span><select value={businessId} onChange={(event) => setBusinessId(event.target.value)} required><option value="">Select a business</option>{businesses.map((business) => <option value={business.id} key={business.id}>{business.businessName}</option>)}</select></label>
          {businesses.length === 0 && <div className="notice notice-error">Add a business before assigning a card.</div>}
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setAssigning(null)} disabled={saving}>Cancel</button><button className="button button-primary" type="submit" disabled={saving || businesses.length === 0}>{saving ? "Saving..." : "Save as inactive"}</button></div>
        </form>
      </Modal>}
    </>
  );
}