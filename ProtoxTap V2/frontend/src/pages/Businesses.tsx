import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { createBusiness, deleteBusiness, getBusinesses, updateBusiness, type Business, type BusinessInput } from "../services/api";

const emptyForm: BusinessInput = { businessName: "", contactName: "", email: "", phone: "", notes: "" };

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Business | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<BusinessInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setBusinesses(await getBusinesses());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load businesses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function openForm(business?: Business) {
    setEditing(business ?? null);
    setFormOpen(true);
    setForm(business ? {
      businessName: business.businessName,
      contactName: business.contactName ?? "",
      email: business.email ?? "",
      phone: business.phone ?? "",
      notes: business.notes ?? "",
    } : emptyForm);
    setError("");
    setNotice("");
  }

  async function saveBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await updateBusiness(editing.id, form);
      else await createBusiness(form);
      setNotice(editing ? "Business updated." : "Business added.");
      setEditing(null);
      setFormOpen(false);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save business.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBusiness(business: Business) {
    if (!window.confirm(`Delete ${business.businessName}? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteBusiness(business.id);
      setNotice(`${business.businessName} deleted.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete business.");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">ACCOUNTS</span><h1>Businesses</h1><p>Manage the businesses attached to your cards.</p></div>
        <button className="button button-primary" onClick={() => openForm()}>+ <span>Add business</span></button>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      <section className="data-section">
        <div className="data-section-head"><span>{businesses.length} {businesses.length === 1 ? "business" : "businesses"}</span><span>Business directory</span></div>
        {loading ? <div className="page-state">Loading businesses...</div> : businesses.length === 0 ? <div className="empty-state"><span className="empty-mark">B</span><h2>No businesses yet</h2><p>Add a business to start assigning review cards.</p><button className="button button-secondary" onClick={() => openForm()}>Add your first business</button></div> : <>
          <div className="business-table-wrap" style={{ overflowX: "auto" }}><table className="business-table" style={{ minWidth: 760 }}><thead><tr><th>Business</th><th>Contact</th><th>Email</th><th>Phone</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {businesses.map((business) => <tr key={business.id}>
              <td data-label="Business"><strong>{business.businessName}</strong></td>
              <td data-label="Contact">{business.contactName || <span className="muted">Not set</span>}</td>
              <td data-label="Email">{business.email || <span className="muted">—</span>}</td>
              <td data-label="Phone">{business.phone || <span className="muted">—</span>}</td>
              <td data-label="Actions"><div className="row-actions"><button className="button button-quiet button-small" onClick={() => openForm(business)}>Edit</button><button className="button button-danger-quiet button-small" onClick={() => void removeBusiness(business)}>Delete</button></div></td>
            </tr>)}
          </tbody></table></div>
          <div className="business-card-list">{businesses.map((business) => <article className="business-card" key={business.id}>
            <div className="business-card-title"><div><span className="eyebrow">BUSINESS</span><h2>{business.businessName}</h2></div><div className="row-actions"><button className="button button-quiet button-small" onClick={() => openForm(business)}>Edit</button><button className="button button-danger-quiet button-small" onClick={() => void removeBusiness(business)}>Delete</button></div></div>
            <dl className="business-details"><div><dt>Contact</dt><dd>{business.contactName || "Not set"}</dd></div><div><dt>Email</dt><dd>{business.email || "—"}</dd></div><div><dt>Phone</dt><dd>{business.phone || "—"}</dd></div></dl>
          </article>)}</div>
        </>}
      </section>
      {formOpen && (
        <Modal title={editing ? "Edit business" : "Add business"} onClose={() => !saving && setFormOpen(false)}>
          <form className="form-stack" onSubmit={saveBusiness}>
            <label className="field"><span>Business name</span><input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} required autoFocus /></label>
            <label className="field"><span>Contact name</span><input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} /></label>
            <label className="field"><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="field"><span>Phone</span><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label className="field"><span>Notes</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} /></label>
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add business"}</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
