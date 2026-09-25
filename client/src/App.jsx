import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://studentform-i3xs.onrender.com'

const companies = [
  ['TCS', 'Information technology', 'blue'], ['Wipro', 'Information technology', 'violet'], ['HCLTech', 'Technology services', 'orange'],
  ['Infosys', 'Information technology', 'green'], ['Accenture', 'Consulting & technology', 'pink'], ['Deloitte', 'Consulting & advisory', 'teal'],
  ['Cognizant', 'Information technology', 'navy'], ['Capgemini', 'Digital services', 'red'], ['IBM', 'Technology & consulting', 'indigo'], ['Microsoft', 'Software & cloud', 'cyan'],
].map(([name, category, tone]) => ({ name, category, tone }))

const emptyForm = { studentName: '', age: '', rollNo: '', dateOfBirth: '', bloodGroup: '', parentName: '', mobileNumber: '', emailId: '', nickName: '', department: '', gender: '', batchYear: '', section: '', arrears: '' }

function App() {
  const [view, setView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/registrations`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load registrations')
        return response.json()
      })
      .then(setRegistrations)
      .catch(() => setNotice('Unable to load registrations from the server.'))
  }, [])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const startNewRegistration = () => { setView('register'); setStep(1); setNotice('') }
  const openCompanyStep = (event) => {
    event.preventDefault()
    if (Number(form.arrears) !== 0) { setNotice('Company preferences open only for students with zero arrears.'); return }
    setNotice(''); setStep(2)
  }
  const toggleCompany = (company) => setSelectedCompanies((current) => {
    if (current.includes(company.name)) return current.filter((item) => item !== company.name)
    if (current.length === 4) { setNotice('You can select up to 4 companies.'); return current }
    setNotice(''); return [...current, company.name]
  })
  const submitRegistration = async (event) => {
    event.preventDefault()
    if (selectedCompanies.length !== 4) { setNotice('Choose exactly 4 companies before submitting.'); return }
    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companies: selectedCompanies }),
      })
      if (!response.ok) throw new Error('Unable to save registration')
      const registration = await response.json()
      setRegistrations((current) => [registration, ...current])
      setView('admin'); setStep(1); setForm(emptyForm); setSelectedCompanies([]); setNotice('Registration saved successfully.')
    } catch {
      setNotice('Unable to save registration. Check that the server is running.')
    }
  }
  const filtered = registrations.filter((item) => `${item.studentName} ${item.rollNo} ${item.department}`.toLowerCase().includes(search.toLowerCase()))

  return <div className="app-shell">
    <header className="topbar"><button className="brand" type="button" onClick={startNewRegistration}><span className="brand-mark">SR</span><span><strong>Student</strong> Registry<small>Placement cell</small></span></button><nav className="main-nav" aria-label="Main navigation"><button className={view === 'register' ? 'nav-link active' : 'nav-link'} type="button" onClick={startNewRegistration}>Student registration</button><button className={view === 'admin' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setView('admin')}>Admin overview <span className="nav-count">{registrations.length}</span></button></nav></header>
    <main>{view === 'register' ? <section className="registration-page">
      <div className="page-intro"><div><p className="eyebrow">2025 - 26 placement drive</p><h1>Build your next chapter.</h1><p className="intro-copy">Register your details and tell us where you want to go. Your information stays with the placement cell.</p></div><div className="stepper" aria-label={`Step ${step} of 2`}><span className={step === 1 ? 'step current' : 'step done'}><b>01</b> Your details</span><i /><span className={step === 2 ? 'step current' : 'step'}><b>02</b> Company preferences</span></div></div>
      {notice && <div className="notice" role="status">{notice}</div>}
      {step === 1 ? <form className="form-card" onSubmit={openCompanyStep}><div className="card-heading"><div><span className="section-number">01</span><h2>Personal information</h2></div><p>All fields marked <em>*</em> are required</p></div><div className="field-grid"><Field label="Student name" name="studentName" value={form.studentName} onChange={updateField} required placeholder="e.g. Ananya Sharma" /><Field label="Nick name" name="nickName" value={form.nickName} onChange={updateField} placeholder="What should we call you?" /><Field label="Roll number" name="rollNo" value={form.rollNo} onChange={updateField} required placeholder="e.g. 21CSE042" /><Field label="Date of birth" name="dateOfBirth" value={form.dateOfBirth} onChange={updateField} required type="date" /><Field label="Age" name="age" value={form.age} onChange={updateField} required type="number" min="16" max="40" placeholder="Years" /><SelectField label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={updateField} required options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} /><Field label="Parent name" name="parentName" value={form.parentName} onChange={updateField} required placeholder="Full name" /><Field label="Mobile number" name="mobileNumber" value={form.mobileNumber} onChange={updateField} required type="tel" pattern="[0-9]{10}" placeholder="10 digit mobile number" /><Field label="Email ID" name="emailId" value={form.emailId} onChange={updateField} required type="email" placeholder="you@example.com" /></div><div className="card-heading subheading"><div><span className="section-number">02</span><h2>Academic information</h2></div></div><div className="field-grid"><SelectField label="Department" name="department" value={form.department} onChange={updateField} required options={['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering']} /><SelectField label="Gender" name="gender" value={form.gender} onChange={updateField} required options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} /><SelectField label="Batch year" name="batchYear" value={form.batchYear} onChange={updateField} required options={['2022', '2023', '2024', '2025', '2026']} /><SelectField label="Section" name="section" value={form.section} onChange={updateField} required options={['A', 'B', 'C', 'D']} /><Field label="No. of arrears" name="arrears" value={form.arrears} onChange={updateField} required type="number" min="0" placeholder="Enter 0 if none" /></div><div className="form-footer"><p>Zero arrears unlocks the company preference step.</p><button className="primary-button" type="submit">Continue to preferences <span>-&gt;</span></button></div></form> : <form className="form-card company-card" onSubmit={submitRegistration}><div className="card-heading"><div><span className="section-number">02</span><h2>Company preferences</h2></div><p><strong>{selectedCompanies.length}/4</strong> selected</p></div><div className="company-intro"><span className="spark">*</span><p>Select the four companies you would most like to connect with. We&apos;ll use this to plan your placement sessions.</p></div><div className="company-grid">{companies.map((company, index) => <button className={selectedCompanies.includes(company.name) ? 'company-option selected' : 'company-option'} type="button" key={company.name} onClick={() => toggleCompany(company)}><span className={`company-logo ${company.tone}`}>{company.name.slice(0, 2)}</span><span><strong>{company.name}</strong><small>{company.category}</small></span><span className="check">{selectedCompanies.includes(company.name) ? 'check' : String(index + 1).padStart(2, '0')}</span></button>)}</div><div className="form-footer"><button className="back-button" type="button" onClick={() => setStep(1)}><span>&lt;-</span> Back to details</button><button className="primary-button" type="submit">Complete registration <span>-&gt;</span></button></div></form>}
    </section> : <section className="admin-page"><div className="page-intro admin-intro"><div><p className="eyebrow">Placement cell / admin</p><h1>Registration overview.</h1><p className="intro-copy">See who is interested in each company and keep every application in one place.</p></div><button className="primary-button" type="button" onClick={startNewRegistration}>+ New registration</button></div>{notice && <div className="notice success" role="status">{notice}</div>}<div className="admin-summary"><div><small>Total registered</small><strong>{registrations.length.toString().padStart(2, '0')}</strong></div><div><small>Eligible students</small><strong>{registrations.filter((item) => Number(item.arrears) === 0).length.toString().padStart(2, '0')}</strong></div><div><small>Companies represented</small><strong>{new Set(registrations.flatMap((item) => item.companies)).size.toString().padStart(2, '0')}</strong></div><label className="search-box"><span>?</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" aria-label="Search students" /></label></div><div className="admin-content"><div className="company-summary"><div className="table-heading"><h2>By company</h2><span>Selected preferences</span></div>{companies.map((company) => { const count = filtered.filter((item) => item.companies.includes(company.name)).length; return <div className="company-row" key={company.name}><span className={`company-logo ${company.tone}`}>{company.name.slice(0, 2)}</span><strong>{company.name}</strong><span className="company-bar"><i style={{ width: `${registrations.length ? Math.max(5, (count / registrations.length) * 100) : 5}%` }} /></span><b>{count}</b></div> })}</div><div className="student-list"><div className="table-heading"><h2>All students</h2><span>{filtered.length} registrations</span></div>{filtered.length ? filtered.map((registration) => <article className="student-row" key={registration.id}><span className="avatar">{registration.studentName.slice(0, 2).toUpperCase()}</span><div><strong>{registration.studentName}</strong><small>{registration.rollNo} / {registration.department}</small></div><div className="student-companies">{registration.companies.map((company) => <span key={company}>{company}</span>)}</div></article>) : <div className="empty-state"><span>SR</span><strong>No registrations yet</strong><p>Completed student registrations will appear here.</p></div>}</div></div></section>}</main><footer><span>STUDENT REGISTRY</span><span>Placement office · 2025 - 26</span></footer>
  </div>
}

function Field({ label, name, value, onChange, ...props }) { return <label className="field"><span>{label}{props.required && <em>*</em>}</span><input name={name} value={value} onChange={onChange} {...props} /></label> }
function SelectField({ label, name, value, onChange, options, required }) { return <label className="field"><span>{label}{required && <em>*</em>}</span><select name={name} value={value} onChange={onChange} required={required}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label> }

export default App