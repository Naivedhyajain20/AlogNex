'use client'
import { useState } from 'react'

export default function Login({ onLogin, hasAccount, username: savedUser }) {
  const [isSignUp, setIsSignUp] = useState(!hasAccount)
  const [user, setUser] = useState(savedUser || '') // ALGONEX ID
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignUp && pass !== confirmPass) {
      alert("Passwords don't match!")
      return
    }
    setLoading(true)
    await onLogin(user, email, pass, isSignUp)
    setLoading(false)
  }

  return (
    <div className="login-screen">
      <div className="login-card glass">
        {/* Decorative elements */}
        <div className="card-accent top"></div>
        <div className="card-accent bottom"></div>

        <div className="login-header">
          <div className="logo-section">
            <img src="/logo.png" alt="ALGONEX Logo" width="60" height="60" className="brand-logo shadow-glow" />
            <h1 className="brand-name">
              <span className="algo-white">ALGO</span><span className="nex-orange">NEX</span>
            </h1>
          </div>
          <p className="subtitle" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>MASTER YOUR LEETCODE JOURNEY</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group row">
            <label>{isSignUp ? 'Email Address' : 'Email or ALGONEX ID'}</label>
            <input 
              type={isSignUp ? "email" : "text"}
              placeholder={isSignUp ? "you@example.com" : "Email or username"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div className="form-group row">
              <label>ALGONEX ID (Username)</label>
              <input 
                type="text" 
                placeholder="e.g. naivedhya"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group row">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
          {isSignUp && (
            <div className="form-group row">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="form-control"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Launch Journey →' : 'Enter Workspace ↪')}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            {isSignUp ? 'Already on path?' : 'New here?'}
            <button className="link-btn" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}
