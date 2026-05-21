"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  ExternalLink,
  Flag,
  MapPin,
  Plane,
  X,
} from "lucide-react";
import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { renderLinkedText } from "@/lib/linkify";

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
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<FinalItem | null>(null);
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
        setCollapsedDates(new Set());
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Final 行程載入失敗");
      } finally {
        setIsLoading(false);
      }
    }

    loadFinal();
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedItem]);

  function toggleDate(date: string) {
    setCollapsedDates((current) => {
      const next = new Set(current);

      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }

      return next;
    });
  }

  function collapseAllDates() {
    setCollapsedDates(new Set(groupedItems.map((group) => group.date)));
  }

  function expandAllDates() {
    setCollapsedDates(new Set());
  }

  function scrollToDate(date: string) {
    document.getElementById(`final-day-${toDateAnchor(date)}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openItemDetails(item: FinalItem) {
    setSelectedItem(item);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>, item: FinalItem) {
    if (event.currentTarget !== event.target) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemDetails(item);
    }
  }

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

        {groupedItems.length > 0 ? (
          <div className="date-tools" aria-label="日期快速操作">
            <div className="date-jump-list" aria-label="日期快速跳轉">
              {groupedItems.map((group) => (
                <button className="date-chip" key={group.date} onClick={() => scrollToDate(group.date)} type="button">
                  {formatShortDate(group.date)}
                  <span>{group.items.length}</span>
                </button>
              ))}
            </div>
            <div className="collapse-actions">
              <button className="button secondary compact-control" onClick={expandAllDates} type="button">
                全部展開
              </button>
              <button className="button secondary compact-control" onClick={collapseAllDates} type="button">
                全部收合
              </button>
            </div>
          </div>
        ) : null}

        <div className={`day-list ${isLoading ? "loading" : ""}`}>
          {groupedItems.map((group) => (
            <section
              className={`day-group ${collapsedDates.has(group.date) ? "collapsed" : ""}`}
              id={`final-day-${toDateAnchor(group.date)}`}
              key={group.date}
            >
              <div className="day-group-header">
                <button
                  aria-expanded={!collapsedDates.has(group.date)}
                  className="day-toggle"
                  onClick={() => toggleDate(group.date)}
                  type="button"
                >
                  {collapsedDates.has(group.date) ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  <h3>{group.date}</h3>
                </button>
                <span>{group.items.length} 筆</span>
              </div>

              {!collapsedDates.has(group.date) ? (
                <div className="timeline">
                  {group.items.map((item) => (
                    <article
                      className={`timeline-item compact-card family-row family-${item.familyId}`}
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`查看 ${item.title} 詳細內容`}
                      onClick={() => openItemDetails(item)}
                      onKeyDown={(event) => handleCardKeyDown(event, item)}
                    >
                      <div className="timeline-time">
                        <Clock3 size={16} />
                        {formatTimeRange(item)}
                      </div>
                      <div className="final-content">
                        <div className="final-title-row">
                          <span className={`family-badge family-${item.familyId}`}>{item.familyName}</span>
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
                          <p className="compact-note">
                            {renderLinkedText([item.description, item.notes].filter(Boolean).join(" / "))}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </section>
      {selectedItem ? <FinalDetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} /> : null}
    </main>
  );
}

function FinalDetailDialog({ item, onClose }: { item: FinalItem; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const firstFocusable = getFocusableElements(dialogRef.current)[0];
    firstFocusable?.focus();
  }, []);

  function keepFocusInside(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements(dialogRef.current);

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <div className="detail-overlay" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby={`final-detail-title-${item.id}`}
        aria-modal="true"
        className={`detail-dialog family-row family-${item.familyId}`}
        role="dialog"
        onKeyDown={keepFocusInside}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="detail-header">
          <div>
            <span className="detail-kicker">{item.familyName}</span>
            <h2 id={`final-detail-title-${item.id}`}>{item.title}</h2>
          </div>
          <button className="button icon-only secondary" aria-label="關閉詳情" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <div className="detail-body">
          <div className="detail-meta-grid">
            <div className="meta">
              <CalendarDays size={16} />
              {item.date}
            </div>
            <div className="meta">
              <Clock3 size={16} />
              {formatTimeRange(item)}
            </div>
            <div className="meta">
              <DollarSign size={16} />
              {formatCost(item.estimatedCost)}
            </div>
            <div className="meta">
              <Flag size={16} />
              已加入 final
            </div>
          </div>

          <section className="detail-section">
            <h3>地點</h3>
            {item.mapUrl ? (
              <a className="inline-link" href={item.mapUrl} rel="noreferrer" target="_blank">
                {item.location}
                <ExternalLink size={14} />
              </a>
            ) : (
              <p>{item.location || "未填寫"}</p>
            )}
          </section>

          <section className="detail-section">
            <h3>行程內容</h3>
            <p>{renderLinkedText(item.description)}</p>
          </section>

          <section className="detail-section">
            <h3>備註</h3>
            <p>{renderLinkedText(item.notes)}</p>
          </section>
        </div>

        <footer className="detail-actions">
          <button className="button secondary" onClick={onClose} type="button">
            關閉
          </button>
        </footer>
      </section>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
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

function toDateAnchor(date: string) {
  return date.replaceAll("-", "");
}

function formatShortDate(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function renderLocation(item: FinalItem) {
  if (!item.mapUrl) {
    return item.location;
  }

  return (
    <a
      className="inline-link"
      href={item.mapUrl}
      rel="noreferrer"
      target="_blank"
      onClick={(event) => event.stopPropagation()}
    >
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
