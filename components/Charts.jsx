'use client'
import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  LineElement, PointElement, LinearScale, CategoryScale,
  Filler,
  LineController,
  DoughnutController
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  LineController,
  DoughnutController
)

export function DifficultyChart({ problems }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()

    let e = 0, m = 0, h = 0
    problems.forEach(p => {
      const d = p.difficulty?.toLowerCase()
      if (d === 'easy') e++
      else if (d === 'hard') h++
      else m++
    })

    chartRef.current = new ChartJS(ref.current, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: [e, m, h],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#9ca3af', usePointStyle: true, padding: 20 },
          },
        },
      },
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [problems])

  return <canvas ref={ref} />
}

export function ProductivityChart({ problems, activities }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()

    const now = new Date()
    const labels = []
    const data = []

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString([], { weekday: 'short' }))

      const start = new Date(d).setHours(0, 0, 0, 0)
      const end = new Date(d).setHours(23, 59, 59, 999)

      let count = 0
      activities.forEach(a => {
        const t = new Date(a.timestamp).getTime()
        if (t >= start && t <= end) count++
      })
      problems.forEach(p => {
        const t = new Date(p.solvedAt).getTime()
        if (t >= start && t <= end) count++
      })
      data.push(count)
    }

    chartRef.current = new ChartJS(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Activity',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
          y: { ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        },
      },
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [problems, activities])

  return <canvas ref={ref} />
}
