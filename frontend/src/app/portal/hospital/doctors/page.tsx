'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { useAuth } from '@/lib/auth-context';
import {
  addHospitalDoctor,
  getHospitalProfile,
  removeAffiliatedDoctor,
  updateHospitalDoctorLink,
} from '@/lib/hospital-portal-store';
import { getMainSpecialties } from '@/data';
import type { EmploymentType, Hospital, HospitalDoctorLink } from '@/types';

export default function HospitalDoctorsPage() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState('general-physician');
  const [consultationFee, setConsultationFee] = useState('2500');
  const [yearsExperience, setYearsExperience] = useState('5');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [departmentId, setDepartmentId] = useState('');
  const [pmcNumber, setPmcNumber] = useState('');

  const specialties = getMainSpecialties();

  const refresh = () => {
    if (!user?.hospitalId) return;
    setHospital(getHospitalProfile(user.hospitalId));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hospitalId]);

  const links: HospitalDoctorLink[] = hospital?.doctors ?? [];

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setSpecialtySlug('general-physician');
    setConsultationFee('2500');
    setYearsExperience('5');
    setEmploymentType('FULL_TIME');
    setDepartmentId('');
    setPmcNumber('');
    setEditingId(null);
  };

  const add = () => {
    if (!user?.hospitalId || !fullName.trim()) {
      setMessage('Doctor name is required.');
      return;
    }
    addHospitalDoctor(user.hospitalId, {
      fullName,
      phone: phone || undefined,
      specialtySlug,
      consultationFee,
      yearsExperience: Number(yearsExperience) || 1,
      employmentType,
      departmentId: departmentId || null,
      pmcNumber: pmcNumber || undefined,
    });
    setMessage('Doctor added to your hospital.');
    resetForm();
    refresh();
  };

  const startEdit = (link: HospitalDoctorLink) => {
    setEditingId(link.id);
    setFullName(link.doctor.user.fullName);
    setPhone(link.doctor.user.phone);
    setSpecialtySlug(link.doctor.specialties[0]?.specialty.slug ?? 'general-physician');
    setConsultationFee(link.doctor.consultationFee);
    setYearsExperience(String(link.doctor.yearsExperience));
    setEmploymentType(link.employmentType);
    setDepartmentId(link.departmentId ?? '');
    setPmcNumber(link.doctor.pmcNumber ?? '');
  };

  const saveEdit = () => {
    if (!user?.hospitalId || !editingId || !fullName.trim()) return;
    updateHospitalDoctorLink(user.hospitalId, editingId, {
      fullName,
      phone,
      specialtySlug,
      consultationFee,
      employmentType,
      departmentId: departmentId || null,
    });
    setMessage('Doctor updated.');
    resetForm();
    refresh();
  };

  const remove = (linkId: string) => {
    if (!user?.hospitalId) return;
    removeAffiliatedDoctor(user.hospitalId, linkId);
    if (editingId === linkId) resetForm();
    setMessage('Doctor removed from hospital.');
    refresh();
  };

  return (
    <HospitalPortalLayout title="Hospital Doctors">
      <p className="entity-card-muted" style={{ marginBottom: 16, maxWidth: 640 }}>
        Manage doctors who work at <strong>{hospital?.name ?? 'your hospital'}</strong>.
        These staff profiles belong to this facility — not the full marketplace catalog.
      </p>

      <div className="cred-section" style={{ marginBottom: 24, maxWidth: 820 }}>
        <div className="cred-section-header">
          <h3>{editingId ? 'Edit doctor' : 'Add doctor'}</h3>
          {editingId && (
            <button type="button" className="cred-remove-link" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
        <div className="cred-fields" style={{ marginBottom: 16 }}>
          <div className="form-field">
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. name" />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XXXXXXXXX" />
          </div>
          <div className="form-field">
            <label>Specialty</label>
            <select value={specialtySlug} onChange={(e) => setSpecialtySlug(e.target.value)}>
              {specialties.map((s) => (
                <option key={s.id} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Consultation fee (PKR)</label>
            <input value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Years experience</label>
            <input value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
          </div>
          <div className="form-field">
            <label>PMC number</label>
            <input value={pmcNumber} onChange={(e) => setPmcNumber(e.target.value)} placeholder="Optional" />
          </div>
          <div className="form-field">
            <label>Employment</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
              <option value="FULL_TIME">FULL_TIME</option>
              <option value="VISITING">VISITING</option>
              <option value="CONSULTANT">CONSULTANT</option>
            </select>
          </div>
          <div className="form-field">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">None</option>
              {(hospital?.departments ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          {editingId ? (
            <button type="button" className="btn btn-primary" onClick={saveEdit}>Save changes</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={add}>Add to hospital</button>
          )}
        </div>
        {message && <p style={{ color: 'var(--primary-navy)', marginTop: 12 }}>{message}</p>}
      </div>

      <h3 style={{ marginBottom: 14 }}>Staff ({links.length})</h3>
      {links.length === 0 ? (
        <div className="empty-state">No doctors at this hospital yet. Add your first staff doctor above.</div>
      ) : (
        <div className="entity-grid">
          {links.map((l) => (
            <article key={l.id} className="entity-card">
              <div className="entity-card-top">
                <div className="avatar-circle">{l.doctor.user.fullName.charAt(0)}</div>
                <div className="entity-card-meta">
                  <h3 className="entity-card-title">
                    {l.doctor.title}. {l.doctor.user.fullName}
                  </h3>
                  <p className="entity-card-subtitle">{l.doctor.specialties[0]?.specialty.name}</p>
                  <p className="entity-card-muted">{l.doctor.user.phone}</p>
                </div>
              </div>
              <div className="chip-row">
                <span className="chip">{l.employmentType}</span>
                {l.department && <span className="chip">{l.department.name}</span>}
                {l.isPrimary && <span className="chip">Primary</span>}
                <span className="chip">
                  PKR {Number(l.doctor.consultationFee).toLocaleString()}
                </span>
              </div>
              <div className="entity-card-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                <button type="button" className="btn btn-outline cred-add-btn" onClick={() => startEdit(l)}>
                  Edit
                </button>
                <button type="button" className="cred-remove-link" onClick={() => remove(l.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </HospitalPortalLayout>
  );
}
