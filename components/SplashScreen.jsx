'use client'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState('fade-in')

  useEffect(() => {
    // Phase 1: Wait 1.5s
    const timer = setTimeout(() => {
      setFade('fade-out')
    }, 1500)

    // Phase 2: Finish after another 0.5s
    const finishTimer = setTimeout(() => {
      onFinish()
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className={`splash-overlay ${fade}`}>
      <div className="splash-content">
        <img src="/logo.png" alt="ALGONEX Logo" className="splash-logo" />
        <h1 className="splash-text"><span className="algo-brand">ALGO</span><span className="nex-orange">NEX</span></h1>
      </div>
      <style jsx>{`
        .splash-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease-in-out;
        }
        .fade-in {
          opacity: 1;
        }
        .fade-out {
          opacity: 0;
        }
        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: scale-up 1.5s ease-out forwards;
        }
        .splash-logo {
          width: 150px;
          height: 150px;
          object-fit: contain;
          filter: drop-shadow(0 0 20px var(--primary-glow));
        }
        .splash-text {
          font-family: var(--font-logo), sans-serif;
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          40% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
