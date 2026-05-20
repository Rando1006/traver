"use client";

import { ArrowLeft, CalendarDays, Clock3, DollarSign, Flag, MapPin, Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type FinalItem = {
  id: number;
  familyId: number;
  familyName: string;
  date: string;
  startTime: string;
  endTime: string | null;
  title: string;
  location: string;
  description: string;
  estimatedCost: string | null;
  notes: string;
};

export default function FinalPage() {
  const [items, setItems] = useState<FinalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFinal() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/final");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Final 行程載入失敗");
        }

        setItems(payload);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Final 行程載入失敗");
      } finally {
        setIsLoading(false);
      }
    }

    loadFinal();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Plane size={24} />
          </div>
          <div>
            <h1>Final 行程</h1>
            <p>所有家庭已加入 final 的活動，依日期與時間排序。</p>
          </div>
        </div>
        <nav className="nav-actions" aria-label="主要導覽">
          <Link className="button secondary" href="/">
            <ArrowLeft size={18} />
            回家庭行程
          </Link>
        </nav>
      </header>

      <section className="panel list-panel final-panel">
        <div className="list-toolbar">
          <div>
            <h2>彙整清單</h2>
            <p>{items.length} 筆 final 行程。</p>
          </div>
          <button className="button secondary" onClick={() => window.location.reload()} type="button">
            重新整理
          </button>
        </div>

        {error ? <div className="message error">{error}</div> : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="empty-state">
            <div>
              <Flag size={42} />
              <h3>還沒有 final 行程</h3>
              <p>回到家庭行程，把候選活動加入 final 後會出現在這裡。</p>
            </div>
          </div>
        ) : null}

        <div className={`timeline ${isLoading ? "loading" : ""}`}>
          {items.map((item) => (
            <article className="timeline-item" key={item.id}>
              <div>
                <div className="timeline-date">{item.date}</div>
                <div className="meta" style={{ marginTop: 8 }}>
                  <Clock3 size={15} />
                  {formatTimeRange(item)}
                </div>
              </div>
              <div className="final-content">
                <span className="family-badge">{item.familyName}</span>
                <div className="card-title">
                  <h3>{item.title}</h3>
                  <p>{item.location}</p>
                </div>
                <div className="meta-grid">
                  <span className="meta">
                    <CalendarDays size={15} />
                    {item.date}
                  </span>
                  <span className="meta">
                    <MapPin size={15} />
                    {item.location}
                  </span>
                  <span className="meta">
                    <DollarSign size={15} />
                    {formatCost(item.estimatedCost)}
                  </span>
                </div>
                {item.description ? <p className="card-text">{item.description}</p> : null}
                {item.notes ? <div className="card-notes">{item.notes}</div> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatTimeRange(item: FinalItem) {
  const start = item.startTime.slice(0, 5);
  const end = item.endTime?.slice(0, 5);
  return end ? `${start} - ${end}` : start;
}

function formatCost(value: string | null) {
  if (!value) {
    return "未填";
  }

  return `NT$ ${Number(value).toLocaleString("zh-TW")}`;
}
