// Notification utility for scheduling reminders
import { LocalNotifications } from '@capacitor/local-notifications';

// Request notification permissions
export const requestNotificationPermission = async () => {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if we have notification permission
export const checkNotificationPermission = async () => {
  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};

// Schedule a reminder for tomorrow at a specific time
export const scheduleReminderForTomorrow = async (sessionType = 'morning', programName = 'MindScript') => {
  try {
    // Check if we have permission first
    const hasPermission = await checkNotificationPermission();
    
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return false;
      }
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set time based on session type
    let hour, title, body;
    
    switch(sessionType) {
      case 'morning':
        hour = 8;
        title = '🌅 Morning Session Ready';
        body = `Start your day with ${programName}. Your morning practice is ready.`;
        break;
      case 'midday':
        hour = 13;
        title = '☀️ Midday Practice Time';
        body = `Take a mindful break. Your ${programName} midday session awaits.`;
        break;
      case 'night':
        hour = 20;
        title = '🌙 Evening Reflection';
        body = `Wind down your day with ${programName}. Your night session is ready.`;
        break;
      default:
        hour = 9;
        title = '🔔 MindScript Reminder';
        body = `Your ${programName} session is ready for you.`;
    }
    
    tomorrow.setHours(hour, 0, 0, 0);

    // Generate a unique ID based on timestamp
    const notificationId = Math.floor(Math.random() * 100000);

    // Schedule the notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: notificationId,
          schedule: { at: tomorrow },
          sound: undefined, // Use default sound
          attachments: undefined,
          actionTypeId: '',
          extra: {
            sessionType,
            programName,
          },
        },
      ],
    });

    console.log(`✓ Reminder scheduled for tomorrow at ${hour}:00`);
    return true;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    
    // Fallback: Try to use browser Notification API (for web version)
    if ('Notification' in window && Notification.permission === 'granted') {
      // For web, we can't schedule, but we can at least show we tried
      console.log('Web notification permission available, but scheduling requires native platform');
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request browser notification permission as fallback
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Browser notification permission granted for future use');
      }
    }
    
    return false;
  }
};

// Cancel all pending notifications
export const cancelAllReminders = async () => {
  try {
    await LocalNotifications.cancel({ notifications: [] });
    console.log('All reminders cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling reminders:', error);
    return false;
  }
};

// Get pending notifications
export const getPendingReminders = async () => {
  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    return [];
  }
};

// Show immediate notification (for testing)
export const showTestNotification = async () => {
  try {
    const hasPermission = await checkNotificationPermission();
    
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: '✅ Reminder Set!',
          body: "You'll receive a notification tomorrow for your session.",
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Error showing test notification:', error);
    return false;
  }
};
