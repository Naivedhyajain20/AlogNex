import { NextResponse } from 'next/server'

async function fetchLeetcode(query, variables) {
  const body = JSON.stringify({ query, variables })
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://leetcode.com',
    },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`LeetCode API HTTP ${res.status}`)
  return res.json()
}

export async function GET(request, { params }) {
  const username = params.username
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          profile {
            realName
            userAvatar
            ranking
            reputation
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `
    const data = await fetchLeetcode(query, { username })
    let totalSolved = 0
    let profileMeta = null
    let difficultyBreakdown = { easy: 0, medium: 0, hard: 0 }
    try {
      const userObj = data.data.matchedUser
      profileMeta = userObj.profile
      const stats = userObj.submitStats.acSubmissionNum
      const allDiff = stats.find(d => d.difficulty === 'All')
      if (allDiff) totalSolved = allDiff.count

      // Per-difficulty breakdown
      const easy = stats.find(d => d.difficulty === 'Easy')
      const medium = stats.find(d => d.difficulty === 'Medium')
      const hard = stats.find(d => d.difficulty === 'Hard')
      difficultyBreakdown = {
        easy: easy?.count || 0,
        medium: medium?.count || 0,
        hard: hard?.count || 0,
      }
    } catch (e) { }

    return NextResponse.json({ status: 'success', totalSolved, profileMeta, difficultyBreakdown })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 })
  }
}
