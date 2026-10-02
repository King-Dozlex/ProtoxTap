import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBusinesses, getCards, type Business, type Card } from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getBusinesses(), getCards()])
      .then(([businessList, cardList]) => {
        setBusinesses(businessList);
        setCards(cardList);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const counts = [
    { label: "Businesses", value: businesses.length, tone: "mint", href: "/admin/businesses" },
    { label: "Total cards", value: cards.length, tone: "gold", href: "/admin/cards" },
    { label: "Active", value: cards.filter((card) => card.status === "active").length, tone: "green", href: "/admin/cards" },
    { label: "Inactive", value: cards.filter((card) => card.status === "inactive").length, tone: "blue", href: "/admin/cards" },
    { label: "Unassigned", value: cards.filter((card) => card.status === "unassigned").length, tone: "coral", href: "/admin/cards" },
  ];

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>Current state of your businesses and cards.</p></div>
        <span className="live-indicator"><i /> System overview</span>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading ? <div className="page-state">Loading overview...</div> : <>
        <section className="metric-grid" aria-label="System totals">
          {counts.map((item, index) => <Link className={`metric metric-${item.tone}`} to={item.href} key={item.label} style={{ animationDelay: `${index * 55}ms` }}>
            <span className="metric-label">{item.label}</span><strong>{item.value}</strong><span className="metric-foot">View {item.label.toLowerCase()} <span aria-hidden="true">&gt;</span></span>
          </Link>)}
        </section>
        <section className="workflow-section">
          <div className="section-heading"><div><span className="eyebrow">CARD LIFECYCLE</span><h2>From stock to live</h2></div><Link className="text-link" to="/admin/cards">Manage cards <span aria-hidden="true">→</span></Link></div>
          <div className="workflow-track">
            <div><StatusBadge status="unassigned" /><span>Ready to assign</span></div><b aria-hidden="true">&gt;</b>
            <div><StatusBadge status="inactive" /><span>Assigned, not live</span></div><b aria-hidden="true">&gt;</b>
            <div><StatusBadge status="active" /><span>Live and redirecting</span></div>
          </div>
        </section>
      </>}
    </>
  );
}