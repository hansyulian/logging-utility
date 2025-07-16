const endpoint = 'http://localhost:9952/';

export async function hansLog(...parameters: any[]): Promise<void> {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });
  } catch (error) {
    console.error('Failed to log to server:', error);
  }
}