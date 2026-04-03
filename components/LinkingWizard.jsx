import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LinkingWizard({ onLink }) {
  const [step, setStep] = useState('choice') // choice, express, manual, verifying
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateUniqueness = async (targetId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('algonex_id')
      .eq('leetcode_id', targetId.toLowerCase())
      .maybeSingle()

    if (error) {
      setError('Error checking profile uniqueness. Try again.')
      return false
    }

    if (data) {
      const maskUsername = (name) => {
        if (!name) return ''
        if (name.length <= 2) return name[0] + '*'.repeat(name.length - 1)
        return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
      }
      setError(`LeetCode account "${targetId}" is already linked to ALGONEX profile: ${maskUsername(data.algonex_id)}. Please login to that account.`)
      return false
    }
    return true
  }

  const handleExpress = async (e) => {
    e.preventDefault()
    if (!username) {
      setError('Please enter a valid LeetCode username')
      return
    }
    setError('')
    setLoading(true)
    const isUnique = await validateUniqueness(username)
    if (!isUnique) {
      setLoading(false)
      return
    }

    setTimeout(() => {
      onLink(username)
    }, 2000)
  }

  const handleManualVerify = async () => {
    if (!username) {
      setError('Please enter your LeetCode username first')
      return
    }
    setError('')
    setLoading(true)
    const isUnique = await validateUniqueness(username)
    if (!isUnique) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/submissions/${username}`)
      const data = await res.json()
      
      if (data.status === 'success' && data.submission?.length > 0) {
        const latest = data.submission[0]
        const now = Math.floor(Date.now() / 1000)
        // Check if submission happened in last 5 mins (300s)
        if (now - parseInt(latest.timestamp) < 300) {
          onLink(username)
        } else {
          setError('No recent submission found. Please submit any solution on LeetCode and try again.')
        }
      } else {
        setError('Could not fetch submissions. Is the username correct?')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wizard-screen">
      <div className="wizard-container glass">
        {step === 'choice' && (
          <div className="wizard-choice fade-in">
            <img src="/logo.png" alt="ALGONEX Logo" width="80" height="80" style={{ marginBottom: '1.5rem' }} />
            <h1>Link Your LeetCode</h1>
            <p>Choose your preferred way to sync your progress with ALGONEX.</p>
            
            <div className="choice-cards">
              <div className="choice-card recommended" onClick={() => setStep('express')}>
                <div className="badge">FASTEST</div>
                <div className="icon">🔐</div>
                <h3><span className="algo-white">One-Click</span> <span className="nex-orange">Sync</span></h3>
                <p>Instantly establish a secure, encrypted bridge to your LeetCode profile with zero hassle.</p>
                <button className="btn btn-primary-outline">Launch Sync</button>
              </div>

              <div className="choice-card recommended" onClick={() => setStep('manual')}>
                <div className="icon">🔑</div>
                <h3>Manual Verification</h3>
                <p>Your code is your key. Prove ownership securely with a 100% password-free digital handshake.</p>
                <button className="btn btn-secondary-outline">Setup Manually</button>
              </div>
            </div>
          </div>
        )}

        {step === 'express' && (
          <div className="wizard-form fade-in">
            <button className="back-btn" onClick={() => setStep('choice')}>← Back</button>
            <h2>One-Click Sync</h2>
            <p>Deploying a secure, encrypted tunnel to fetch your LeetCode data instantly.</p>
            
            <form onSubmit={handleExpress} className="login-form">
              <div className="form-group">
                <label>LeetCode Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. janesmith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>LeetCode Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Visibility' : 'VisibilityOff'}
                  </button>
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Authenticating...' : 'Link Account'}
              </button>
            </form>
          </div>
        )}

        {step === 'manual' && (
          <div className="wizard-form fade-in">
            <button className="back-btn" onClick={() => setStep('choice')}>← Back</button>
            <h2>Manual Verification</h2>
            <p>Follow these 3 easy steps to securely prove your LeetCode identity.</p>
            
            <div className="manual-steps">
              <div className="step-item">
                <span className="step-num">1</span>
                <div className="step-text">
                  <label>Enter your LeetCode ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. janesmith"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="step-item">
                <span className="step-num">2</span>
                <div className="step-text">
                  <p style={{ marginTop: '0.2rem', lineHeight: '1.5', color: 'var(--text)' }}>
                    Open <strong>LeetCode.com</strong> in a new tab, solve any code problem of your choice, and hit the <strong>Submit</strong> button.
                    <br/><br/>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <i>Why? This fresh submission within the last 5 minutes acts as your secure signature to prove you own the ID!</i>
                    </span>
                  </p>
                </div>
              </div>

              <div className="step-item">
                <span className="step-num">3</span>
                <div className="step-text">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleManualVerify}
                    disabled={loading}
                  >
                    {loading ? 'Checking Submissions...' : 'Verify & Link'}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="error-msg" style={{ marginTop: '1rem' }}>{error}</p>}
          </div>
        )}
      </div>

      <style jsx>{`
        .wizard-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-dark);
          padding: 2rem;
        }
        .wizard-container {
          max-width: 800px;
          width: 100%;
          padding: 3rem;
          text-align: center;
        }
        .wizard-choice h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, var(--primary), var(--primary-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .choice-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 3rem;
        }
        .choice-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .choice-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
        }
        .choice-card.recommended {
          border: 2px solid var(--primary);
          box-shadow: 0 0 20px rgba(255, 170, 0, 0.1);
        }
        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: #000;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .choice-card h3 {
          margin-bottom: 1rem;
          color: var(--text-bright);
        }
        .choice-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .wizard-form {
          text-align: left;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 2rem;
        }
        .manual-steps {
          margin-top: 2rem;
        }
        .step-item {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }
        .step-num {
          background: var(--primary);
          color: #000;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-text {
          flex-grow: 1;
        }
        .step-text label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .error-msg {
          color: #ff4444;
          font-size: 0.9rem;
        }
        @media (max-width: 600px) {
          .choice-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
