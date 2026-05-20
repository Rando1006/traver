"use client";

import { ArrowLeft, Clock3, DollarSign, ExternalLink, Flag, MapPin, Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FinalItem = {
  id: number;
  familyId: number;
  familyName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  title: string;
  location: string;
  mapUrl: string | null;
  description: string;
  estimatedCost: string | null;
  notes: string;
};

type DateGroup = {
  date: string;
  items: FinalItem[];
};

export default function FinalPage() {
  const [items, setItems] = useState<FinalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groupedItems = useMemo(() => groupByDate(items), [items]);

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
            <p>所有家庭已加入 final 的活動，依日期分組並按時間排序。</p>
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

        <div className={`day-list ${isLoading ? "loading" : ""}`}>
          {groupedItems.map((group) => (
            <section className="day-group" key={group.date}>
              <div className="day-group-header">
                <div>
                  <h3>{group.date}</h3>
                </div>
                <span>{group.items.length} 筆</span>
              </div>

              <div className="timeline">
                {group.items.map((item) => (
                  <article className="timeline-item compact-card" key={item.id}>
                    <div className="timeline-time">
                      <Clock3 size={16} />
                      {formatTimeRange(item)}
                    </div>
                    <div className="final-content">
                      <div className="final-title-row">
                        <span className="family-badge">{item.familyName}</span>
                        <div className="card-title">
                          <h3>{item.title}</h3>
                          <p>
                            <MapPin size={14} />
                            {renderLocation(item)}
                          </p>
                        </div>
                        <span className="compact-cost">
                          <DollarSign size={14} />
                          {formatCost(item.estimatedCost)}
                        </span>
                      </div>
                      {item.description || item.notes ? (
                        <p className="compact-note">{[item.description, item.notes].filter(Boolean).join(" / ")}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

function groupByDate(items: FinalItem[]): DateGroup[] {
  const groups = new Map<string, FinalItem[]>();

  for (const item of items) {
    const group = groups.get(item.date) ?? [];
    group.push(item);
    groups.set(item.date, group);
  }

  return Array.from(groups, ([date, groupedItems]) => ({ date, items: groupedItems }));
}

function renderLocation(item: FinalItem) {
  if (!item.mapUrl) {
    return item.location;
  }

  return (
    <a className="inline-link" href={item.mapUrl} rel="noreferrer" target="_blank">
      {item.location}
      <ExternalLink size={13} />
    </a>
  );
}

function formatTimeRange(item: FinalItem) {
  if (!item.startTime) {
    return "未填時間";
  }

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
