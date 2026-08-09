'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getDoctorProfile, setDoctorCredentials } from '@/lib/doctor-portal-store';
import type {
  DocumentStatus,
  DocumentType,
  DoctorDocument,
  DoctorEducation,
  DoctorExperience,
  DoctorLanguage,
  VerificationStatus,
} from '@/types';

const COMMON_DEGREES = ['MBBS', 'BDS', 'FCPS', 'MCPS', 'MD', 'MS', 'MRCP', 'FRCS', 'PhD', 'Diploma'];
const COMMON_LANGUAGES = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki'];

const REQUIRED_DOC_TYPES: {
  type: DocumentType;
  label: string;
  hint: string;
  required: boolean;
}[] = [
  {
    type: 'PMC_CERTIFICATE',
    label: 'PMC registration certificate',
    hint: 'Pakistan Medical & Dental Council / PMC license copy',
    required: true,
  },
  {
    type: 'CNIC_FRONT',
    label: 'CNIC (front)',
    hint: 'National identity card — front side',
    required: true,
  },
  {
    type: 'CNIC_BACK',
    label: 'CNIC (back)',
    hint: 'National identity card — back side',
    required: true,
  },
  {
    type: 'DEGREE',
    label: 'Primary medical degree',
    hint: 'MBBS / BDS or equivalent degree certificate',
    required: true,
  },
  {
    type: 'EXPERIENCE_LETTER',
    label: 'Experience / fellowship letter',
    hint: 'Hospital experience or specialty fellowship proof',
    required: false,
  },
  {
    type: 'OTHER',
    label: 'Other supporting document',
    hint: 'Additional specialty certificates or awards',
    required: false,
  },
];

function statusLabel(status: DocumentStatus) {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'UNDER_REVIEW') return 'Under review';
  if (status === 'REJECTED') return 'Rejected';
  return 'Uploaded';
}

function verificationHint(status: VerificationStatus) {
  if (status === 'APPROVED') return 'Your profile is verified and visible to patients.';
  if (status === 'PENDING') return 'Submitted for review. Complete missing credentials to speed approval.';
  if (status === 'REJECTED') return 'Verification was rejected. Update documents and resubmit.';
  if (status === 'SUSPENDED') return 'Account suspended. Contact support.';
  return 'Complete PMC, education, and required documents to submit for verification.';
}

export default function DoctorCredentialsPage() {
  const { user } = useAuth();
  const [pmcNumber, setPmcNumber] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('DRAFT');
  const [educations, setEducations] = useState<DoctorEducation[]>([]);
  const [experiences, setExperiences] = useState<DoctorExperience[]>([]);
  const [languages, setLanguages] = useState<DoctorLanguage[]>([]);
  const [documents, setDocuments] = useState<DoctorDocument[]>([]);
  const [message, setMessage] = useState('');
  const [langInput, setLangInput] = useState('');

  useEffect(() => {
    if (!user?.doctorId) return;
    const d = getDoctorProfile(user.doctorId);
    setPmcNumber(d?.pmcNumber ?? '');
    setYearsExperience(d?.yearsExperience ?? 0);
    setVerificationStatus(d?.verificationStatus ?? 'DRAFT');
    setEducations(d?.educations ?? []);
    setExperiences(d?.experiences ?? []);
    setLanguages(d?.languages ?? []);
    setDocuments(d?.documents ?? []);
  }, [user?.doctorId]);

  const checklist = useMemo(() => {
    const hasPmc = pmcNumber.trim().length >= 5;
    const hasYears = yearsExperience > 0;
    const hasEdu = educations.some((e) => e.degree.trim() && e.institute.trim());
    const hasExp = experiences.some((e) => e.organization.trim() && e.roleTitle.trim());
    const hasLang = languages.length > 0;
    const requiredDocs = REQUIRED_DOC_TYPES.filter((d) => d.required).map((d) => d.type);
    const uploadedRequired = requiredDocs.filter((t) => documents.some((doc) => doc.type === t));
    return [
      { id: 'pmc', label: 'PMC registration number', done: hasPmc },
      { id: 'years', label: 'Years of clinical experience', done: hasYears },
      { id: 'edu', label: 'At least one education entry', done: hasEdu },
      { id: 'exp', label: 'At least one work experience', done: hasExp },
      { id: 'lang', label: 'Consultation languages', done: hasLang },
      {
        id: 'docs',
        label: `Required documents (${uploadedRequired.length}/${requiredDocs.length})`,
        done: uploadedRequired.length === requiredDocs.length,
      },
    ];
  }, [pmcNumber, yearsExperience, educations, experiences, languages, documents]);

  const completeness = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100,
  );

  const save = () => {
    if (!user?.doctorId) return;
    setDoctorCredentials(user.doctorId, {
      pmcNumber: pmcNumber.trim() || null,
      yearsExperience: Math.max(0, Number(yearsExperience) || 0),
      educations,
      experiences,
      languages,
      documents,
    });
    setMessage('Credentials saved to your profile.');
    setTimeout(() => setMessage(''), 2500);
  };

  const addEducation = () => {
    if (!user?.doctorId) return;
    setEducations((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        doctorId: user.doctorId!,
        degree: 'MBBS',
        institute: '',
        yearFrom: new Date().getFullYear() - 6,
        yearTo: new Date().getFullYear() - 1,
        sortOrder: prev.length,
      },
    ]);
  };

  const addExperience = () => {
    if (!user?.doctorId) return;
    const year = new Date().getFullYear();
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        doctorId: user.doctorId!,
        organization: '',
        roleTitle: 'Consultant',
        startDate: `${year - 2}-01-01`,
        endDate: null,
        isCurrent: true,
        description: null,
      },
    ]);
  };

  const addLanguage = (value?: string) => {
    const lang = (value ?? langInput).trim();
    if (!lang || !user?.doctorId) return;
    if (languages.some((l) => l.language.toLowerCase() === lang.toLowerCase())) {
      setLangInput('');
      return;
    }
    setLanguages((p) => [
      ...p,
      { id: `lng-${Date.now()}`, doctorId: user.doctorId!, language: lang },
    ]);
    setLangInput('');
  };

  const upsertDocument = (type: DocumentType, fileName: string) => {
    if (!user?.doctorId || !fileName.trim()) return;
    const now = new Date().toISOString();
    setDocuments((prev) => {
      const existing = prev.find((d) => d.type === type);
      if (existing) {
        return prev.map((d) =>
          d.id === existing.id
            ? {
                ...d,
                fileName: fileName.trim(),
                storageKey: `demo/${user.doctorId}/${type.toLowerCase()}`,
                mimeType: 'application/pdf',
                status: 'UPLOADED' as DocumentStatus,
                updatedAt: now,
                notes: null,
              }
            : d,
        );
      }
      return [
        ...prev,
        {
          id: `doc-${Date.now()}`,
          doctorId: user.doctorId!,
          type,
          status: 'UPLOADED',
          storageKey: `demo/${user.doctorId}/${type.toLowerCase()}`,
          fileName: fileName.trim(),
          mimeType: 'application/pdf',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];
    });
  };

  const removeDocument = (type: DocumentType) => {
    setDocuments((prev) => prev.filter((d) => d.type !== type));
  };

  return (
    <DoctorPortalLayout title="Credentials">
      <div className="cred-page">
        <div className="cred-page-actions">
          <div>
            <p className="cred-page-hint">
              PMC registration, qualifications, experience, languages, and verification documents
              patients and reviewers rely on.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={save}>
            Save credentials
          </button>
        </div>
        {message && <p className="cred-toast">{message}</p>}

        <section className="cred-checklist">
          <div className="cred-checklist-top">
            <div>
              <h3>Credential completeness</h3>
              <p>{verificationHint(verificationStatus)}</p>
            </div>
            <div className="cred-completeness" aria-label={`${completeness}% complete`}>
              <strong>{completeness}%</strong>
              <span>complete</span>
            </div>
          </div>
          <div className="cred-checklist-bar">
            <span style={{ width: `${completeness}%` }} />
          </div>
          <ul className="cred-checklist-list">
            {checklist.map((item) => (
              <li key={item.id} className={item.done ? 'done' : ''}>
                <span aria-hidden>{item.done ? '✓' : '○'}</span>
                {item.label}
              </li>
            ))}
          </ul>
          <div className="cred-verify-row">
            <span className={`status-pill ${verificationStatus === 'APPROVED' ? 'CONFIRMED' : 'PENDING_PAYMENT'}`}>
              {verificationStatus}
            </span>
            <span className="cred-verify-note">Verification status (platform-managed)</span>
          </div>
        </section>

        <section className="cred-section">
          <div className="cred-section-header">
            <div>
              <h3>Professional registration</h3>
              <p className="cred-section-lead">Required for practicing in Pakistan</p>
            </div>
          </div>
          <div className="cred-fields cred-fields-3">
            <div className="form-field">
              <label>PMC number</label>
              <input
                value={pmcNumber}
                onChange={(e) => setPmcNumber(e.target.value)}
                placeholder="e.g. PMC-12345"
              />
            </div>
            <div className="form-field">
              <label>Years of experience</label>
              <input
                type="number"
                min={0}
                max={60}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label>Issuing body</label>
              <input value="Pakistan Medical Commission (PMC)" readOnly />
            </div>
          </div>
          <p className="cred-help">
            Enter the registration number exactly as printed on your PMC certificate. Patients see this
            on your public profile.
          </p>
        </section>

        <section className="cred-section">
          <div className="cred-section-header">
            <div>
              <h3>Education & qualifications</h3>
              <p className="cred-section-lead">Degrees, fellowships, and training institutes</p>
            </div>
            <button type="button" className="btn btn-outline cred-add-btn" onClick={addEducation}>
              + Add
            </button>
          </div>
          <div className="cred-chip-row">
            {COMMON_DEGREES.map((deg) => (
              <button
                key={deg}
                type="button"
                className="cred-chip"
                onClick={() => {
                  if (!user?.doctorId) return;
                  setEducations((prev) => [
                    ...prev,
                    {
                      id: `edu-${Date.now()}`,
                      doctorId: user.doctorId!,
                      degree: deg,
                      institute: '',
                      yearFrom: new Date().getFullYear() - 5,
                      yearTo: new Date().getFullYear(),
                      sortOrder: prev.length,
                    },
                  ]);
                }}
              >
                + {deg}
              </button>
            ))}
          </div>
          {educations.length === 0 ? (
            <p className="cred-empty">Add MBBS and any specialty qualifications (FCPS, MCPS, etc.).</p>
          ) : (
            <div className="cred-list">
              {educations.map((e, index) => (
                <div key={e.id} className="cred-entry">
                  <div className="cred-entry-top">
                    <span className="cred-entry-index">Qualification #{index + 1}</span>
                    <button
                      type="button"
                      className="cred-remove-link"
                      onClick={() => setEducations((p) => p.filter((x) => x.id !== e.id))}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cred-fields">
                    <div className="form-field">
                      <label>Degree / qualification</label>
                      <input
                        value={e.degree}
                        onChange={(ev) =>
                          setEducations((p) =>
                            p.map((x) => (x.id === e.id ? { ...x, degree: ev.target.value } : x)),
                          )
                        }
                        placeholder="MBBS, FCPS Cardiology…"
                      />
                    </div>
                    <div className="form-field">
                      <label>Institute / university</label>
                      <input
                        value={e.institute}
                        onChange={(ev) =>
                          setEducations((p) =>
                            p.map((x) => (x.id === e.id ? { ...x, institute: ev.target.value } : x)),
                          )
                        }
                        placeholder="King Edward Medical University"
                      />
                    </div>
                    <div className="form-field">
                      <label>Year from</label>
                      <input
                        type="number"
                        min={1950}
                        max={2100}
                        value={e.yearFrom ?? ''}
                        onChange={(ev) =>
                          setEducations((p) =>
                            p.map((x) =>
                              x.id === e.id
                                ? { ...x, yearFrom: ev.target.value ? Number(ev.target.value) : null }
                                : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Year to</label>
                      <input
                        type="number"
                        min={1950}
                        max={2100}
                        value={e.yearTo ?? ''}
                        onChange={(ev) =>
                          setEducations((p) =>
                            p.map((x) =>
                              x.id === e.id
                                ? { ...x, yearTo: ev.target.value ? Number(ev.target.value) : null }
                                : x,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cred-section">
          <div className="cred-section-header">
            <div>
              <h3>Clinical experience</h3>
              <p className="cred-section-lead">Hospitals, clinics, and roles held</p>
            </div>
            <button type="button" className="btn btn-outline cred-add-btn" onClick={addExperience}>
              + Add
            </button>
          </div>
          {experiences.length === 0 ? (
            <p className="cred-empty">Add current and past clinical appointments.</p>
          ) : (
            <div className="cred-list">
              {experiences.map((e, index) => (
                <div key={e.id} className="cred-entry">
                  <div className="cred-entry-top">
                    <span className="cred-entry-index">Role #{index + 1}</span>
                    <button
                      type="button"
                      className="cred-remove-link"
                      onClick={() => setExperiences((p) => p.filter((x) => x.id !== e.id))}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cred-fields">
                    <div className="form-field">
                      <label>Organization / hospital</label>
                      <input
                        value={e.organization}
                        onChange={(ev) =>
                          setExperiences((p) =>
                            p.map((x) =>
                              x.id === e.id ? { ...x, organization: ev.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Shaukat Khanum Memorial Hospital"
                      />
                    </div>
                    <div className="form-field">
                      <label>Role / designation</label>
                      <input
                        value={e.roleTitle}
                        onChange={(ev) =>
                          setExperiences((p) =>
                            p.map((x) => (x.id === e.id ? { ...x, roleTitle: ev.target.value } : x)),
                          )
                        }
                        placeholder="Consultant, Registrar, HO…"
                      />
                    </div>
                    <div className="form-field">
                      <label>Start date</label>
                      <input
                        type="date"
                        value={e.startDate ?? ''}
                        onChange={(ev) =>
                          setExperiences((p) =>
                            p.map((x) =>
                              x.id === e.id ? { ...x, startDate: ev.target.value || null } : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>End date</label>
                      <input
                        type="date"
                        value={e.endDate ?? ''}
                        disabled={e.isCurrent}
                        onChange={(ev) =>
                          setExperiences((p) =>
                            p.map((x) =>
                              x.id === e.id ? { ...x, endDate: ev.target.value || null } : x,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                  <label className="cred-check">
                    <input
                      type="checkbox"
                      checked={e.isCurrent}
                      onChange={(ev) =>
                        setExperiences((p) =>
                          p.map((x) =>
                            x.id === e.id
                              ? {
                                  ...x,
                                  isCurrent: ev.target.checked,
                                  endDate: ev.target.checked ? null : x.endDate,
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    Currently working here
                  </label>
                  <div className="form-field cred-field-full">
                    <label>Description (optional)</label>
                    <textarea
                      rows={3}
                      value={e.description ?? ''}
                      onChange={(ev) =>
                        setExperiences((p) =>
                          p.map((x) =>
                            x.id === e.id ? { ...x, description: ev.target.value || null } : x,
                          ),
                        )
                      }
                      placeholder="Department, key responsibilities, patient load…"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cred-section">
          <div className="cred-section-header">
            <div>
              <h3>Languages</h3>
              <p className="cred-section-lead">Languages you can consult in</p>
            </div>
          </div>
          <div className="cred-chip-row">
            {COMMON_LANGUAGES.map((lang) => {
              const active = languages.some((l) => l.language.toLowerCase() === lang.toLowerCase());
              return (
                <button
                  key={lang}
                  type="button"
                  className={`cred-chip ${active ? 'active' : ''}`}
                  onClick={() => {
                    if (active) {
                      setLanguages((p) =>
                        p.filter((l) => l.language.toLowerCase() !== lang.toLowerCase()),
                      );
                    } else {
                      addLanguage(lang);
                    }
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          <div className="cred-lang-tags">
            {languages.length === 0 && <p className="cred-empty">Select common languages or add your own.</p>}
            {languages.map((l) => (
              <button
                key={l.id}
                type="button"
                className="cred-lang-tag"
                onClick={() => setLanguages((p) => p.filter((x) => x.id !== l.id))}
                title="Remove language"
              >
                {l.language}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
          <div className="cred-lang-add">
            <input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              placeholder="Add another language"
              onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
            />
            <button type="button" className="btn btn-outline cred-add-btn" onClick={() => addLanguage()}>
              + Add
            </button>
          </div>
        </section>

        <section className="cred-section">
          <div className="cred-section-header">
            <div>
              <h3>Verification documents</h3>
              <p className="cred-section-lead">Upload proof required for PMC verification (demo stores file names)</p>
            </div>
          </div>
          <div className="cred-doc-list">
            {REQUIRED_DOC_TYPES.map((meta) => {
              const doc = documents.find((d) => d.type === meta.type);
              return (
                <article key={meta.type} className={`cred-doc ${doc ? 'has' : ''} ${meta.required ? 'required' : ''}`}>
                  <div className="cred-doc-copy">
                    <div className="cred-doc-title-row">
                      <h4>{meta.label}</h4>
                      {meta.required ? (
                        <span className="cred-doc-badge req">Required</span>
                      ) : (
                        <span className="cred-doc-badge">Optional</span>
                      )}
                    </div>
                    <p>{meta.hint}</p>
                    {doc && (
                      <p className="cred-doc-file">
                        <strong>{doc.fileName}</strong>
                        <span className={`status-pill ${doc.status === 'APPROVED' ? 'CONFIRMED' : 'PENDING_PAYMENT'}`}>
                          {statusLabel(doc.status)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="cred-doc-actions">
                    <label className="btn btn-outline cred-add-btn cred-file-btn">
                      {doc ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                        onChange={(ev) => {
                          const file = ev.target.files?.[0];
                          if (file) upsertDocument(meta.type, file.name);
                          ev.target.value = '';
                        }}
                      />
                    </label>
                    {doc && (
                      <button
                        type="button"
                        className="cred-remove-link"
                        onClick={() => removeDocument(meta.type)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="cred-footer-actions">
          <button type="button" className="btn btn-primary" onClick={save}>
            Save credentials
          </button>
        </div>
      </div>
    </DoctorPortalLayout>
  );
}
