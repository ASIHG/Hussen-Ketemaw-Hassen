import { auth } from './firebase';

export enum EventType {
  SIGNUP = 'signup',
  LOGIN = 'login',
  VIEW_CLUSTER = 'view_cluster',
  AI_ACTION = 'ai_action',
  UPGRADE_CLICK = 'upgrade_click',
  NAVIGATE = 'navigate',
  DASHBOARD_INIT = 'dashboard_init'
}

export async function trackEvent(event: string, metadata: any = {}) {
  try {
    const userId = auth.currentUser?.uid || 'anonymous';
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        metadata,
        userId
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
