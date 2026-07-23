/**
 * Next.js proxy → Django REST endpoint.
 * POST /api/twin/chat
 * Keeps the Django URL server-side; client calls this route.
 */
export async function POST(request) {
  const body = await request.json()
  const djangoUrl = process.env.TWIN_API_URL || 'http://localhost:8000'

  try {
    const upstream = await fetch(`${djangoUrl}/api/twin/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    return Response.json(data, { status: upstream.status })
  } catch {
    return Response.json(
      { response: 'Twin API offline — sandhupardeep300@gmail.com', source: 'fallback' },
      { status: 503 }
    )
  }
}
