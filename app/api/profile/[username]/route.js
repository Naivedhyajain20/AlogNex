import { NextResponse } from 'next/server'

async function fetchLeetcode(query, variables) {
  const body = JSON.stringify({ query, variables })
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body,
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
    try {
      const userObj = data.data.matchedUser
      profileMeta = userObj.profile
      const stats = userObj.submitStats.acSubmissionNum
      const allDiff = stats.find(d => d.difficulty === 'All')
      if (allDiff) totalSolved = allDiff.count
    } catch (e) {}

    return NextResponse.json({ status: 'success', totalSolved, profileMeta })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 })
  }
}
