// frontend/src/routes/onboarding.tsx
// Pre-auth screen: onboarding talks to the API only (invite lookup, OTP,
// profile) and deliberately reads no collections — there is no session yet
// (shape-model.md, screens table). The invite details below are static
// display copy standing in for the invite-lookup API response.
import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import '../styles/session2-screens.css'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingScreen,
})

// Mock invite-lookup response (what GET /api/invites/:token will return).
const invite = {
  managerName: 'Daniel Okafor',
  managerJobTitle: 'Duty Manager',
  locationName: 'Harbourlight Bankside',
  name: 'Priya Nair',
  jobTitle: 'Front Desk',
}

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
              <Avatar name={invite.managerName} size={36} />
              <span>
                <strong>{invite.managerName}</strong> ({invite.managerJobTitle}) invited you to
                join {invite.locationName}
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
                defaultValue={invite.name}
              />
            </div>
            <div>
              <span className="field-label">Job title</span>
              <div className="readonly-field">{invite.jobTitle}</div>
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
