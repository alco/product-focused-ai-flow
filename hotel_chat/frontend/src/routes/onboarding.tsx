// frontend/src/routes/onboarding.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { currentUser, location, managerUser } from '../mock/data'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingScreen,
})

// Mocked mid-entry: four of six OTP digits typed, caret in the fifth box.
const otpDigits = ['4', '8', '2', '7', null, null]
const caretIndex = 4

function OnboardingScreen() {
  return (
    <div className="phone onboard-phone">
      <div className="onboard-scroll">
        <header className="onboard-header">
          <div className="onboard-wordmark">
            Harbourlight<span className="dot">.</span>
          </div>
          <span className="eyebrow">Staff chat</span>
        </header>

        <section className="onboard-step">
          <span className="eyebrow">Step 1 — Verify</span>
          <div className="onboard-card">
            <h3>You&rsquo;ve been invited</h3>
            <div className="invited-by">
              <Avatar name={managerUser.name} size={36} />
              <span>
                <strong>{managerUser.name}</strong> ({managerUser.jobTitle}) invited you to
                join {location.name}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
              Enter the code we texted to +44&nbsp;••••&nbsp;417
            </p>
            <div className="otp-row">
              {otpDigits.map((digit, i) => (
                <span
                  key={i}
                  className={`otp-box${i === caretIndex ? ' active' : ''}`}
                >
                  {digit ?? (i === caretIndex ? <span className="otp-caret">|</span> : '')}
                </span>
              ))}
            </div>
            <div className="resend-line">Resend code (0:42)</div>
            <button type="button" className="btn btn-primary btn-block">
              Continue
            </button>
          </div>
        </section>

        <section className="onboard-step">
          <span className="eyebrow">Step 2 — Profile</span>
          <div className="onboard-card">
            <div className="photo-drop" aria-hidden>
              📷
            </div>
            <div>
              <label className="field-label" htmlFor="onboard-name">
                Your name
              </label>
              <input
                id="onboard-name"
                className="text-input"
                type="text"
                defaultValue={currentUser.name}
              />
            </div>
            <div>
              <span className="field-label">Job title</span>
              <div className="readonly-field">{currentUser.jobTitle}</div>
              <div className="field-note">Set by your manager</div>
            </div>
            <button type="button" className="btn btn-lime btn-join btn-block">
              Join the team
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
