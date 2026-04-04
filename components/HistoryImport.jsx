'use client'
import { useState, useRef } from 'react'
import { showToast } from './Toast'

export default function HistoryImport({ onImport }) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const bookmarkletCode = `javascript:(async () => {
    alert('Exporting your LeetCode history... Please wait.');
    try {
      const response = await fetch('https://leetcode.com/api/problems/all/');
      const data = await response.json();
      const solved = data.stat_status_pairs
        .filter(p => p.status === 'ac')
        .map(p => ({
          title: p.stat.question__title,
          titleSlug: p.stat.question__title_slug,
          difficulty: p.difficulty.level === 1 ? 'Easy' : p.difficulty.level === 2 ? 'Medium' : 'Hard',
          solvedAt: new Date().toISOString()
        }));
      
      const blob = new Blob([JSON.stringify(solved, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'algonex-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Export complete! algonex-export.json has been downloaded. Now upload it back to ALGONEX.');
    } catch (e) {
      alert('Export failed. Make sure you are logged into leetcode.com and try again.');
    }
  })();`.replace(/\n/g, '').replace(/\s\s+/g, ' ')

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const count = onImport(data)
        showToast(`Imported ${count} problems!`, 'success')
      } catch (err) {
        showToast('Invalid file format. Please upload algonex-export.json', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="card" style={{ border: '1px solid var(--primary)', background: 'rgba(255, 161, 22, 0.03)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Historical Data Import</h2>
          <span className="tag" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}>Required Once</span>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        LeetCode hides your full past history for privacy. To get all your older questions tracked (e.g., all 100+), you need to securely export them from your own browser session.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Step 1 */}
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', color: 'var(--bg-dark)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Save the Exporter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Drag this orange button to your browser's Bookmarks Bar:
              </p>
              <a 
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                className="btn btn-primary"
                style={{ cursor: 'grab', padding: '0.75rem 1.25rem', fontSize: '0.95rem', borderRadius: '8px', fontWeight: '700' }}
                title="Drag me to your bookmarks bar!"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                ALGONEX Exporter
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', color: 'var(--bg-dark)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Run it on LeetCode</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Log in to <a href="https://leetcode.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>leetcode.com</a> and click the bookmark you just saved. 
                It will securely download a file named <code>algonex-export.json</code> containing your true history.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div 
          style={{ 
            background: dragOver ? 'rgba(255, 161, 22, 0.05)' : 'rgba(0,0,0,0.02)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: dragOver ? '1px dashed var(--primary)' : '1px solid var(--border)',
            transition: 'all 0.2s ease'
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]) }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', color: 'var(--bg-dark)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Import it here</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Upload that <code>algonex-export.json</code> here, and we will automatically schedule all your past problems for revision securely!
              </p>
              <input 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload algonex-export.json
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
