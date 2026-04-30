export async function trackEvent(name: string, metadata: any = {}) {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        userId: "demo-user-123",
        metadata
      })
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

export async function getGrowthStatus() {
  const res = await fetch("/api/growth/status");
  if (!res.ok) throw new Error("Failed to fetch growth status");
  return res.json();
}
