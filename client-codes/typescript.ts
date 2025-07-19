const endpoint = "http://192.168.0.1:9952/";

export async function hansLog(...parameters: unknown[]): Promise<void> {
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parameters),
    });
  } catch (error) {
    console.error("Failed to log to server:", error);
  }
}
