'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { useAuth } from '@/lib/auth-context';
import {
  DAY_LABELS,
  getDoctorProfile,
  setDoctorAvailability,
} from '@/lib/doctor-portal-store';
import type { AvailabilityMode, DoctorAvailability } from '@/types';

const HOUR_START = 8;
const HOUR_END = 21;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function clampToGrid(mins: number): number {
  const min = HOUR_START * 60;
  const max = HOUR_END * 60;
  return Math.max(min, Math.min(max, mins));
}

function modeClass(mode: AvailabilityMode): string {
  if (mode === 'ONLINE') return 'cal-block-online';
  if (mode === 'CLINIC') return 'cal-block-clinic';
  return 'cal-block-both';
}

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const [windows, setWindows] = useState<DoctorAvailability[]>([]);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftMode, setDraftMode] = useState<AvailabilityMode>('CLINIC');
  const [draftClinicId, setDraftClinicId] = useState('');
  const [draftSlot, setDraftSlot] = useState(15);
  const [drag, setDrag] = useState<{ day: number; startHour: number } | null>(null);
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.doctorId) return;
    const d = getDoctorProfile(user.doctorId);
    setWindows(d?.availabilities ?? []);
    const clinicList = (d?.clinics ?? []).map((c) => ({ id: c.id, name: c.name }));
    setClinics(clinicList);
    setDraftClinicId(clinicList[0]?.id ?? '');
  }, [user?.doctorId]);

  const selected = useMemo(
    () => windows.find((w) => w.id === selectedId) ?? null,
    [windows, selectedId],
  );

  const save = () => {
    if (!user?.doctorId) return;
    setDoctorAvailability(user.doctorId, windows);
    setMessage('Weekly schedule saved.');
    setTimeout(() => setMessage(''), 2500);
  };

  const updateSelected = (patch: Partial<DoctorAvailability>) => {
    if (!selectedId) return;
    setWindows((prev) => prev.map((w) => (w.id === selectedId ? { ...w, ...patch } : w)));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setWindows((prev) => prev.filter((w) => w.id !== selectedId));
    setSelectedId(null);
  };

  const createWindow = (dayOfWeek: number, startHour: number, endHour: number) => {
    if (!user?.doctorId) return;
    const start = Math.min(startHour, endHour);
    const end = Math.max(startHour, endHour) + 1;
    const id = `avl-${Date.now()}`;
    const next: DoctorAvailability = {
      id,
      doctorId: user.doctorId,
      dayOfWeek,
      startTime: minutesToTime(start * 60),
      endTime: minutesToTime(Math.min(end, HOUR_END) * 60),
      slotMinutes: draftSlot,
      mode: draftMode,
      clinicId: draftMode === 'ONLINE' ? null : draftClinicId || null,
      isActive: true,
    };
    setWindows((prev) => [...prev, next]);
    setSelectedId(id);
  };

  const onCellMouseDown = (day: number, hour: number) => {
    setDrag({ day, startHour: hour });
    setHoverHour(hour);
  };

  const onCellMouseEnter = (hour: number) => {
    if (drag) setHoverHour(hour);
  };

  const onCellMouseUp = (day: number, hour: number) => {
    if (!drag || drag.day !== day) {
      setDrag(null);
      setHoverHour(null);
      return;
    }
    createWindow(day, drag.startHour, hour);
    setDrag(null);
    setHoverHour(null);
  };

  const isPreviewCell = (day: number, hour: number) => {
    if (!drag || drag.day !== day || hoverHour == null) return false;
    const lo = Math.min(drag.startHour, hoverHour);
    const hi = Math.max(drag.startHour, hoverHour);
    return hour >= lo && hour <= hi;
  };

  const blocksForDay = (day: number) => windows.filter((w) => w.dayOfWeek === day && w.isActive);

  const blockStyle = (w: DoctorAvailability): React.CSSProperties => {
    const start = clampToGrid(timeToMinutes(w.startTime));
    const end = clampToGrid(timeToMinutes(w.endTime));
    const topPct = ((start - HOUR_START * 60) / ((HOUR_END - HOUR_START) * 60)) * 100;
    const heightPct = Math.max(((end - start) / ((HOUR_END - HOUR_START) * 60)) * 100, 4);
    return { top: `${topPct}%`, height: `${heightPct}%` };
  };

  return (
    <DoctorPortalLayout title="Availability">
      <div className="cal-toolbar">
        <div className="cal-toolbar-left">
          <p className="cal-hint">
            Drag across hours to add a window. Click a block to edit. Color shows consultation mode.
          </p>
          <div className="cal-legend">
            <span className="cal-legend-item"><i className="cal-dot online" /> Online</span>
            <span className="cal-legend-item"><i className="cal-dot clinic" /> Clinic</span>
            <span className="cal-legend-item"><i className="cal-dot both" /> Both</span>
          </div>
        </div>
        <div className="cal-toolbar-right">
          <div className="cal-quick-fields">
            <label>
              New mode
              <select value={draftMode} onChange={(e) => setDraftMode(e.target.value as AvailabilityMode)}>
                <option value="ONLINE">ONLINE</option>
                <option value="CLINIC">CLINIC</option>
                <option value="BOTH">BOTH</option>
              </select>
            </label>
            <label>
              Slot
              <select value={draftSlot} onChange={(e) => setDraftSlot(Number(e.target.value))}>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
              </select>
            </label>
            {draftMode !== 'ONLINE' && (
              <label>
                Clinic
                <select value={draftClinicId} onChange={(e) => setDraftClinicId(e.target.value)}>
                  <option value="">None</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <button type="button" className="btn btn-primary" onClick={save}>Save schedule</button>
        </div>
      </div>

      {message && <p className="cal-toast">{message}</p>}

      <div className="cal-layout">
        <div
          className="cal-board-wrap"
          onMouseLeave={() => {
            setDrag(null);
            setHoverHour(null);
          }}
        >
          <div className="cal-board">
            <div className="cal-corner" />
            {WORK_DAYS.map((d) => (
              <div key={d} className="cal-day-header">
                <strong>{DAY_LABELS[d]}</strong>
                <span>{blocksForDay(d).length} window{blocksForDay(d).length === 1 ? '' : 's'}</span>
              </div>
            ))}

            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="cal-hour-label">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {WORK_DAYS.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className={`cal-cell ${isPreviewCell(day, hour) ? 'preview' : ''}`}
                    onMouseDown={() => onCellMouseDown(day, hour)}
                    onMouseEnter={() => onCellMouseEnter(hour)}
                    onMouseUp={() => onCellMouseUp(day, hour)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          <div className="cal-blocks-layer" aria-hidden={false}>
            {WORK_DAYS.map((day, colIndex) => (
              <div
                key={`col-${day}`}
                className="cal-day-column"
                style={{ left: `calc(64px + ((100% - 64px) / 6) * ${colIndex})`, width: 'calc((100% - 64px) / 6)' }}
              >
                {blocksForDay(day).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`cal-block ${modeClass(w.mode)} ${selectedId === w.id ? 'selected' : ''}`}
                    style={blockStyle(w)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(w.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span className="cal-block-time">{w.startTime}–{w.endTime}</span>
                    <span className="cal-block-mode">{w.mode}</span>
                    <span className="cal-block-meta">{w.slotMinutes}m slots</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <aside className={`cal-editor ${selected ? 'open' : ''}`}>
          {selected ? (
            <>
              <div className="cal-editor-header">
                <h3>Edit window</h3>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedId(null)}>
                  Close
                </button>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Day</label>
                  <select
                    value={selected.dayOfWeek}
                    onChange={(e) => updateSelected({ dayOfWeek: Number(e.target.value) })}
                  >
                    {DAY_LABELS.map((label, i) => (
                      <option key={label} value={i}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Start</label>
                  <input
                    type="time"
                    value={selected.startTime}
                    onChange={(e) => updateSelected({ startTime: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>End</label>
                  <input
                    type="time"
                    value={selected.endTime}
                    onChange={(e) => updateSelected({ endTime: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Slot minutes</label>
                  <select
                    value={selected.slotMinutes}
                    onChange={(e) => updateSelected({ slotMinutes: Number(e.target.value) })}
                  >
                    {[10, 15, 20, 30, 45, 60].map((n) => (
                      <option key={n} value={n}>{n} min</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Mode</label>
                  <div className="cal-mode-pills">
                    {(['ONLINE', 'CLINIC', 'BOTH'] as AvailabilityMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`cal-mode-pill ${modeClass(m)} ${selected.mode === m ? 'active' : ''}`}
                        onClick={() => updateSelected({ mode: m, clinicId: m === 'ONLINE' ? null : selected.clinicId })}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {selected.mode !== 'ONLINE' && (
                  <div className="form-field">
                    <label>Clinic</label>
                    <select
                      value={selected.clinicId ?? ''}
                      onChange={(e) => updateSelected({ clinicId: e.target.value || null })}
                    >
                      <option value="">None</option>
                      {clinics.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <label className="cal-active-toggle">
                  <input
                    type="checkbox"
                    checked={selected.isActive}
                    onChange={(e) => updateSelected({ isActive: e.target.checked })}
                  />
                  Active window
                </label>
                <button type="button" className="btn btn-outline cal-remove-btn" onClick={removeSelected}>
                  Remove window
                </button>
              </div>
            </>
          ) : (
            <div className="cal-editor-empty">
              <h3>Schedule editor</h3>
              <p>Select a colored block to refine times, mode, and clinic — or drag on the grid to create one.</p>
              <ul>
                <li>{windows.length} total windows</li>
                <li>{windows.filter((w) => w.mode === 'ONLINE' || w.mode === 'BOTH').length} online-capable</li>
                <li>{windows.filter((w) => w.mode === 'CLINIC' || w.mode === 'BOTH').length} clinic-capable</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </DoctorPortalLayout>
  );
}
