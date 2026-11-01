/**
 * Sends a JSON POST request and returns the parsed reply.
 * Throws an Error whose message includes the server's reason and the status.
 */
export async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let reason = 'Request failed'
    try {
      const data = await response.json()
      if (data.error) reason = data.error
    } catch {
      // The reply was not JSON, keep the generic reason.
    }
    throw new Error(reason + ' (status ' + response.status + ')')
  }

  return response.json()
}
