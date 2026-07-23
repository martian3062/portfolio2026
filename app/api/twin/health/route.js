export async function GET() {
  const djangoUrl = process.env.TWIN_API_URL || 'http://localhost:8000'
  try {
    const res  = await fetch(`${djangoUrl}/api/twin/health/`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json({ ...data, proxy: 'next' })
  } catch {
    return Response.json({ status: 'offline', proxy: 'next' }, { status: 503 })
  }
}
