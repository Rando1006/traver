"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  ExternalLink,
  FilePlus2,
  Flag,
  MapPin,
  Plane,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Family = {
  id: number;
  name: string;
  displayOrder: number;
};

type ItineraryItem = {
  id: number;
  familyId: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  title: string;
  location: string;
  mapUrl: string | null;
  description: string;
  estimatedCost: string | null;
  notes: string;
  isFinal: boolean;
  sortOrder: number;
};

type FormState = {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  mapUrl: string;
  description: string;
  estimatedCost: string;
  notes: string;
  isFinal: boolean;
};

type DateGroup = {
  date: string;
  items: ItineraryItem[];
};

const emptyForm: FormState = {
  date: "",
  startTime: "",
  endTime: "",
  title: "",
  location: "",
  mapUrl: "",
  description: "",
  estimatedCost: "",
  notes: "",
  isFinal: false,
};

export default function HomePage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<number | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const activeFamily = useMemo(
    () => families.find((family) => family.id === activeFamilyId) ?? null,
    [activeFamilyId, families],
  );
  const groupedItems = useMemo(() => groupByDate(items), [items]);

  useEffect(() => {
    async function loadFamilies() {
      setIsLoading(true);
      setMessage(null);

      try {
        const response = await fetch("/api/families");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "家庭資料載入失敗");
        }

        setFamilies(payload);
        setActiveFamilyId(payload[0]?.id ?? null);
      } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : "家庭資料載入失敗" });
      } finally {
        setIsLoading(false);
      }
    }

    loadFamilies();
  }, []);

  useEffect(() => {
    if (!activeFamilyId) {
      return;
    }

    loadItems(activeFamilyId);
  }, [activeFamilyId]);

  async function loadItems(familyId: number) {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/itinerary?familyId=${familyId}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "行程載入失敗");
      }

      setItems(payload);
      setCollapsedDates(new Set());
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "行程載入失敗" });
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEditing(item: ItineraryItem) {
    setEditingId(item.id);
    setForm({
      date: item.date,
      startTime: item.startTime?.slice(0, 5) ?? "",
      endTime: item.endTime?.slice(0, 5) ?? "",
      title: item.title,
      location: item.location,
      mapUrl: item.mapUrl ?? "",
      description: item.description,
      estimatedCost: item.estimatedCost ?? "",
      notes: item.notes,
      isFinal: item.isFinal,
    });
    setMessage(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

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
    document.getElementById(`family-day-${toDateAnchor(date)}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeFamilyId) {
      setMessage({ type: "error", text: "請先選擇家庭。" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...form,
      familyId: activeFamilyId,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      mapUrl: form.mapUrl || null,
      estimatedCost: form.estimatedCost || null,
    };

    try {
      const response = await fetch(editingId ? `/api/itinerary/${editingId}` : "/api/itinerary", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error ?? "儲存失敗");
      }

      setMessage({ type: "success", text: editingId ? "行程已更新。" : "行程已新增。" });
      resetForm();
      await loadItems(activeFamilyId);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "儲存失敗" });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleFinal(item: ItineraryItem) {
    setMessage(null);

    try {
      const response = await fetch(`/api/itinerary/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFinal: !item.isFinal }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "更新 final 狀態失敗");
      }

      setItems((current) => current.map((row) => (row.id === item.id ? payload : row)));
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "更新 final 狀態失敗" });
    }
  }

  async function removeItem(item: ItineraryItem) {
    const confirmed = window.confirm(`確定刪除「${item.title}」？`);

    if (!confirmed) {
      return;
    }

    setMessage(null);

    try {
      const response = await fetch(`/api/itinerary/${item.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "刪除失敗");
      }

      setItems((current) => current.filter((row) => row.id !== item.id));
      if (editingId === item.id) {
        resetForm();
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "刪除失敗" });
    }
  }

  return (
    <main className={`app-shell family-theme-${activeFamilyId ?? 1}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Plane size={24} />
          </div>
          <div>
            <h1>三家庭旅遊行程</h1>
            <p>各家庭先整理自己的想法，再直接加入 final 行程。</p>
          </div>
        </div>
        <nav className="nav-actions" aria-label="主要導覽">
          <Link className="button secondary" href="/final">
            <Flag size={18} />
            Final 行程
          </Link>
        </nav>
      </header>

      <div className="main-grid">
        <aside className="panel">
          <section className="panel-header">
            <h2>家庭切換</h2>
            <p>目前不做帳密控管，切換只用來分開整理資料。</p>
          </section>

          <div className="family-tabs" role="tablist" aria-label="選擇家庭">
            {families.map((family) => (
              <button
                className={`family-tab family-${family.id} ${family.id === activeFamilyId ? "active" : ""}`}
                key={family.id}
                onClick={() => {
                  setActiveFamilyId(family.id);
                  resetForm();
                  setCollapsedDates(new Set());
                }}
                type="button"
              >
                {family.name}
              </button>
            ))}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <section className="panel-header">
              <h2>{editingId ? "編輯行程" : "新增行程"}</h2>
              <p>{activeFamily ? `${activeFamily.name} 的候選行程` : "載入家庭資料中"}</p>
            </section>

            {message ? <div className={`message ${message.type}`}>{message.text}</div> : null}

            <div className="field-grid">
              <div className="field">
                <label htmlFor="date">日期</label>
                <input
                  id="date"
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="estimatedCost">預估費用</label>
                <input
                  id="estimatedCost"
                  inputMode="decimal"
                  min="0"
                  placeholder="例如 1200"
                  type="number"
                  value={form.estimatedCost}
                  onChange={(event) => updateField("estimatedCost", event.target.value)}
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="startTime">開始時間</label>
                <input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="endTime">結束時間</label>
                <input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="title">活動名稱</label>
              <input
                id="title"
                maxLength={160}
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="location">地點</label>
              <input
                id="location"
                maxLength={180}
                required
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="mapUrl">Google Map 連結</label>
              <input
                id="mapUrl"
                placeholder="https://maps.app.goo.gl/..."
                type="url"
                value={form.mapUrl}
                onChange={(event) => updateField("mapUrl", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="description">活動說明</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="notes">備註</label>
              <textarea id="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </div>

            <label className="checkbox-row">
              <input
                checked={form.isFinal}
                type="checkbox"
                onChange={(event) => updateField("isFinal", event.target.checked)}
              />
              直接加入 final 行程
            </label>

            <div className="button-row">
              <button className="button primary" disabled={isSaving || !activeFamilyId} type="submit">
                <FilePlus2 size={18} />
                {isSaving ? "儲存中" : editingId ? "更新行程" : "新增行程"}
              </button>
              {editingId ? (
                <button className="button secondary" onClick={resetForm} type="button">
                  <X size={18} />
                  取消
                </button>
              ) : null}
            </div>
          </form>
        </aside>

        <section className="panel list-panel">
          <div className="list-toolbar">
            <div>
              <h2>{activeFamily?.name ?? "家庭行程"}</h2>
              <p>
                {items.length} 筆候選行程，{items.filter((item) => item.isFinal).length} 筆已加入 final。
              </p>
            </div>
            <button
              className="button secondary"
              disabled={!activeFamilyId || isLoading}
              onClick={() => activeFamilyId && loadItems(activeFamilyId)}
              type="button"
            >
              重新整理
            </button>
          </div>

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
            {!isLoading && items.length === 0 ? (
              <div className="empty-state">
                <div>
                  <CalendarDays size={42} />
                  <h3>這個家庭還沒有行程</h3>
                  <p>從左側新增第一筆候選行程。</p>
                </div>
              </div>
            ) : null}

            {groupedItems.map((group) => (
              <section
                className={`day-group ${collapsedDates.has(group.date) ? "collapsed" : ""}`}
                id={`family-day-${toDateAnchor(group.date)}`}
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
                  <div className="item-list compact-list">
                    {group.items.map((item) => (
                      <article
                        className={`itinerary-card compact-card family-row family-${item.familyId} ${
                          item.isFinal ? "final" : ""
                        }`}
                        key={item.id}
                      >
                        <div className="compact-time">
                          <Clock3 size={15} />
                          {formatTimeRange(item)}
                        </div>

                        <div className="compact-content">
                          <div className="card-title">
                            <h3>{item.title}</h3>
                            <p>
                              <MapPin size={14} />
                              {renderLocation(item)}
                            </p>
                          </div>

                          {item.description || item.notes ? (
                            <p className="compact-note">
                              {[item.description, item.notes].filter(Boolean).join(" / ")}
                            </p>
                          ) : null}
                        </div>

                        <div className="compact-side">
                          <span className="compact-cost">
                            <DollarSign size={14} />
                            {formatCost(item.estimatedCost)}
                          </span>
                          <button
                            className={`button compact-final ${item.isFinal ? "secondary" : "primary"}`}
                            onClick={() => toggleFinal(item)}
                            type="button"
                          >
                            <CheckCircle2 size={18} />
                            {item.isFinal ? "移出 final" : "加 final"}
                          </button>
                          <button
                            className="button icon-only secondary"
                            title="編輯"
                            type="button"
                            onClick={() => startEditing(item)}
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="button icon-only danger"
                            title="刪除"
                            type="button"
                            onClick={() => removeItem(item)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function groupByDate(items: ItineraryItem[]): DateGroup[] {
  const groups = new Map<string, ItineraryItem[]>();

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

function renderLocation(item: ItineraryItem) {
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

function formatTimeRange(item: ItineraryItem) {
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
