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
  const limit = 50
  try {
    const query = `
      query recentSubmissionList($username: String!, $limit: Int!) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
        }
      }
    `
    const data = await fetchLeetcode(query, { username, limit })
    let submission = []
    try {
      const list = data.data.recentSubmissionList || []
      submission = list.filter(sub => sub.statusDisplay === 'Accepted')
    } catch (e) {}
    return NextResponse.json({ status: 'success', submission })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 })
  }
}
