'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHead } from '@/components/site/PageHead'
import { SiteShell } from '@/components/site/SiteShell'

interface ClassOption { id: string; name: string }
interface Doc { name: string; url: string; type: string; size: number }
interface Submitted { applicationNumber: string; appliedClass?: string }

const STEPS = ['Child’s details', 'Parent / guardian', 'Documents', 'Review']
const DOC_SLOTS = ['Birth certificate', 'Recent school report', 'Passport photograph']
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'application/pdf']

const input =
  'mt-2 h-12 w-full rounded-lg font-normal border border-[var(--cgs-control)] bg-[var(--cgs-surface)] px-4 text-sm text-[var(--cgs-text)] placeholder:text-[var(--cgs-muted)]'
const label = 'block text-sm font-semibold text-[var(--cgs-heading)]'
const primaryBtn =
  'inline-flex h-12 items-center justify-center rounded-lg bg-[var(--cgs-primary)] px-8 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)] disabled:opacity-60'
const backBtn =
  'inline-flex h-12 min-w-[120px] items-center justify-center rounded-lg border border-[var(--cgs-primary)] bg-[var(--cgs-tint)] px-8 text-sm font-semibold text-[var(--cgs-heading)]'

export default function ApplyPage() {
  const [step, setStep] = useState(0)
  const [classes, setClasses] = useState<ClassOption[]>([])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [classId, setClassId] = useState('')
  const [previousSchool, setPreviousSchool] = useState('')
  const [address, setAddress] = useState('')
  const [needs, setNeeds] = useState('')

  const [parentName, setParentName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [altContact, setAltContact] = useState('')

  const [docs, setDocs] = useState<Record<string, Doc>>({})
  const [uploading, setUploading] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<Submitted | null>(null)

  useEffect(() => {
    fetch('/api/public/classes')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.data && setClasses(j.data))
      .catch(() => undefined)
  }, [])

  const className = classes.find((c) => c.id === classId)?.name ?? done?.appliedClass ?? ''
  const go = (n: number) => {
    setError('')
    setStep(n)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  const upload = async (slot: string, file: File) => {
    setError('')
    if (!ACCEPT.includes(file.type)) return setError('Accepted files are JPG, PNG or PDF.')
    if (file.size > MAX_BYTES) return setError('Each file must be 5MB or smaller.')
    setUploading(slot)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'admissions-documents')
      const res = await fetch('/api/public/admissions-upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok && json.success) setDocs((d) => ({ ...d, [slot]: { name: file.name, url: json.data.url, type: slot, size: file.size } }))
      else setError(json.error || 'Failed to upload document')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error uploading file')
    } finally {
      setUploading('')
    }
  }

  const submit = async () => {
    if (!confirmed) return setError('Please confirm the details are correct before submitting.')
    setBusy(true)
    setError('')
    try {
      // Relationship, alternative contact and access needs have no dedicated API field yet,
      // so they travel with the parent name / address and stay visible to the school office.
      const extra = [altContact && `Alternative contact: ${altContact}`, needs && `Learning or access needs: ${needs}`].filter(Boolean)
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: `${firstName} ${lastName}`.trim(),
          dateOfBirth: dob || undefined,
          appliedClassId: classId || classes[0]?.id || 'cls-default',
          parentName: relationship ? `${parentName} (${relationship})` : parentName,
          parentEmail,
          parentPhone,
          address: [address, ...extra].join('\n'),
          previousSchool: previousSchool || undefined,
          documents: Object.values(docs).map(({ name, url, type }) => ({ name, url, type })),
        }),
      })
      const json = await res.json()
      if (json.success) setDone(json.data)
      else setError(json.error || 'Failed to submit application. Please check all fields.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error contacting admissions server')
    } finally {
      setBusy(false)
    }
  }

  const fmtDob = dob ? new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <SiteShell active="/admissions">
      <PageHead eyebrow="Admissions · 2026–2027 session" title="A new beginning starts here." sub="Save your progress and return at any time. Fields marked * are required." />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Application steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={i === step && !done ? 'step' : undefined}
              className={`flex h-14 items-center rounded-lg px-4 text-sm font-semibold ${i === (done ? 0 : step) && !done ? 'bg-[var(--cgs-sidebar)] text-[var(--cgs-on-sidebar)]' : 'bg-[var(--cgs-tint)] text-[var(--cgs-heading)]'}`}
            >
              <span className="mr-2">{done || i < step ? '✓' : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.9fr_1fr]">
          {done ? (
            <section className="rounded-3xl bg-[var(--cgs-tint)] p-8 lg:min-h-[380px]" aria-live="polite">
              <h2 className="mt-8 text-4xl font-semibold text-[var(--cgs-heading)]">Application received</h2>
              <p className="mt-10 text-xl">Thank you, {parentName}. We have received {firstName}’s application for {className}.</p>
              <p className="mt-16 text-lg">Reference: {done.applicationNumber}</p>
              <p className="mt-8 max-w-2xl text-lg">The school office will review your documents and contact you about the next step. Keep this reference when you contact us.</p>
              <Link href="/" className={`${primaryBtn} mt-16 w-full max-w-[400px]`}>Back to home</Link>
            </section>
          ) : (
            <form
              className="rounded-3xl bg-[var(--cgs-tint)]/50 p-8"
              onSubmit={(e) => {
                e.preventDefault()
                if (step < 3) go(step + 1)
                else submit()
              }}
            >
              {error && <p role="alert" className="mb-6 rounded-lg border border-[var(--cgs-danger)] bg-[var(--cgs-danger-soft)] p-4 text-sm text-[var(--cgs-danger)]">{error}</p>}

              {step === 0 && (
                <>
                  <h2 className="text-3xl font-semibold text-[var(--cgs-heading)]">Tell us about your child</h2>
                  <div className="mt-8 grid gap-x-9 gap-y-8 sm:grid-cols-2">
                    <label className={label}>First name *<input required className={input} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Chiamaka" /></label>
                    <label className={label}>Last name *<input required className={input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Okafor" /></label>
                    <label className={label}>Date of birth *<input required type="date" className={input} value={dob} onChange={(e) => setDob(e.target.value)} /></label>
                    <label className={label}>Applying for *
                      <select required className={input} value={classId} onChange={(e) => setClassId(e.target.value)}>
                        <option value="">Select class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className={`${label} mt-8`}>Current school<input className={input} value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} placeholder="School name" /></label>
                  <label className={`${label} mt-8`}>Home address *<input required minLength={5} className={input} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street and area" /></label>
                  <label className={`${label} mt-8`}>Learning or access needs
                    <span className="mt-3 block text-base font-normal text-[var(--cgs-text)]">Tell us how we can support your child. This will not affect admission decisions.</span>
                    <textarea rows={2} className={`${input} h-auto py-3`} value={needs} onChange={(e) => setNeeds(e.target.value)} />
                  </label>
                  <div className="mt-10"><button type="submit" className={`${primaryBtn} w-full max-w-[300px]`}>Save and continue</button></div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-3xl font-semibold text-[var(--cgs-heading)]">Parent / guardian details</h2>
                  <div className="mt-8 space-y-8">
                    <label className={label}>Full name *<input required minLength={3} className={input} value={parentName} onChange={(e) => setParentName(e.target.value)} /></label>
                    <label className={label}>Relationship *<input required className={input} value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Mother" /></label>
                    <label className={label}>Email address *<input required type="email" className={input} value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} /></label>
                    <label className={label}>Phone number *<input required type="tel" minLength={7} className={input} value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} /></label>
                    <label className={label}>Alternative contact<input className={input} value={altContact} onChange={(e) => setAltContact(e.target.value)} placeholder="e.g. another parent or guardian" /></label>
                  </div>
                  <div className="mt-12 flex gap-10"><button type="button" onClick={() => go(0)} className={backBtn}>Back</button><button type="submit" className={`${primaryBtn} flex-1`}>Save and continue</button></div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-3xl font-semibold text-[var(--cgs-heading)]">Upload supporting documents</h2>
                  <div className="mt-8 space-y-6">
                    {DOC_SLOTS.map((slot) => {
                      const d = docs[slot]
                      return (
                        <div key={slot} className="rounded-lg border border-[var(--cgs-control)] bg-[var(--cgs-surface)] p-5">
                          <h3 className="text-xl font-semibold text-[var(--cgs-heading)]">{slot}</h3>
                          <p className="mt-4 text-sm">{d ? `${d.name} · ${Math.max(1, Math.round(d.size / 1024))}KB · Uploaded` : uploading === slot ? 'Uploading…' : 'Not uploaded yet'}</p>
                          <label className="mt-4 inline-block cursor-pointer text-sm font-semibold text-[var(--cgs-primary)] hover:underline">
                            {d ? 'Replace document →' : 'Choose file →'}
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(slot, e.target.files[0])} />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-12 flex gap-10"><button type="button" onClick={() => go(1)} className={backBtn}>Back</button><button type="submit" className={`${primaryBtn} flex-1`}>Save and continue</button></div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-3xl font-semibold text-[var(--cgs-heading)]">Review your application</h2>
                  <h3 className="mt-10 font-semibold text-[var(--cgs-heading)]">Child</h3>
                  <p className="mt-4 text-lg leading-relaxed">{firstName} {lastName} · Applying for {className}<br />Date of birth: {fmtDob}{previousSchool && <><br />Current school: {previousSchool}</>}</p>
                  <h3 className="mt-10 font-semibold text-[var(--cgs-heading)]">Parent / guardian</h3>
                  <p className="mt-4 text-lg leading-relaxed">{parentName} · {relationship}<br />{parentEmail} · {parentPhone}</p>
                  <h3 className="mt-10 font-semibold text-[var(--cgs-heading)]">Documents</h3>
                  <p className="mt-4 text-lg">{DOC_SLOTS.map((s) => (docs[s] ? `✓ ${s}` : `Missing: ${s}`)).join('   ')}</p>
                  <label className="mt-10 flex items-start gap-3 text-lg">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1.5 h-5 w-5 accent-[var(--cgs-primary)]" />
                    I confirm these details are correct and agree to the school processing this application.
                  </label>
                  <p className="mt-8 text-sm">Submission does not guarantee admission. The school office will contact you about the next steps.</p>
                  <div className="mt-12 flex gap-10"><button type="button" onClick={() => go(2)} className={backBtn}>Back</button><button type="submit" disabled={busy} className={`${primaryBtn} flex-1`}>{busy ? 'Submitting…' : 'Submit application'}</button></div>
                </>
              )}
            </form>
          )}

          <aside className="rounded-3xl bg-[var(--cgs-tint)] p-7 lg:min-h-[650px]">
            <h2 className="text-3xl font-semibold text-[var(--cgs-heading)]">Before you begin</h2>
            <p className="mt-8 text-lg">Have these ready:</p>
            <ul className="mt-6 space-y-1 text-lg">
              <li>• Child’s birth certificate</li><li>• Recent school report</li><li>• Parent contact details</li><li>• Passport photograph</li>
            </ul>
            <p className="mt-8 text-lg">Accepted files: JPG, PNG or PDF.<br />Maximum 5MB per file.</p>
            <h2 className="mt-28 text-2xl font-semibold text-[var(--cgs-heading)]">Need help?</h2>
            <p className="mt-6 text-lg">Contact the school office. Your application is private and secure.</p>
          </aside>
        </div>
      </div>
    </SiteShell>
  )
}
