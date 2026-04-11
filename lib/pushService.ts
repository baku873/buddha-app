import * as admin from 'firebase-admin';
import { connectToDatabase } from '@/database/db';
import { ObjectId } from 'mongodb';

/**
 * Initialize Firebase Admin SDK
 * Note: Consumes FIREBASE_SERVICE_ACCOUNT env variable which should be a JSON string
 */
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('🔥 Firebase Admin initialized successfully');
    } else {
      console.warn('🔥 Firebase Admin: FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be disabled.');
    }
  } catch (error) {
    console.error('🔥 Firebase Admin initialization failed:', error);
  }
}

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends a push notification to all registered FCM tokens for a specific user.
 * Supports multiple device tokens and handles stale token cleanup.
 * 
 * @param userId The MongoDB _id of the recipient user or Clerk ID.
 * @param payload The notification content and optional data.
 */
export async function sendPushNotification(userId: string, payload: PushPayload) {
  try {
    if (!admin.apps.length) {
      console.warn('🔥 Skipping push notification: Firebase not initialized');
      return { success: false, error: 'Firebase not initialized' };
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ 
      $or: [
        { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : undefined },
        { clerkId: userId }
      ].filter(Boolean) as any[]
    });

    if (!user) {
      console.log(`🔥 Skipping push notification: User ${userId} not found`);
      return { success: false, error: 'User not found' };
    }

    // --- TOKEN CONSOLIDATION ---
    // Read both user.fcmTokens (array) and user.fcmToken (legacy string)
    const tokens: string[] = [];
    if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
      tokens.push(...user.fcmTokens);
    }
    if (user.fcmToken && typeof user.fcmToken === 'string') {
      tokens.push(user.fcmToken);
    }

    // Filter unique and non-empty tokens
    const uniqueTokens = Array.from(new Set(tokens.filter(t => !!t)));

    if (uniqueTokens.length === 0) {
      console.log(`🔥 Skipping push notification: No FCM tokens for user ${userId}`);
      return { success: false, error: 'No tokens found' };
    }

    // --- MESSAGE CONSTRUCTION ---
    const messages: admin.messaging.Message[] = uniqueTokens.map(token => ({
      token: token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          icon: 'stock_ticker_update',
          color: '#D97706',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    }));

    // --- BATCH DELIVERY ---
    // Use sendEach for reliable delivery to multiple targets
    const batchResponse = await admin.messaging().sendEach(messages);
    console.log(`🔥 Notification attempted to ${uniqueTokens.length} tokens. Successes: ${batchResponse.successCount}, Failures: ${batchResponse.failureCount}`);

    // --- STALE TOKEN CLEANUP ---
    const invalidTokens: string[] = [];
    batchResponse.responses.forEach((resp, index) => {
      if (!resp.success) {
        const error = resp.error as any;
        // Collect invalid tokens: mismatch, not registered, or invalid
        if (error?.code === 'messaging/registration-token-not-registered' || 
            error?.code === 'messaging/invalid-argument') {
          invalidTokens.push(uniqueTokens[index]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      console.log(`🔥 Cleaning up ${invalidTokens.length} invalid tokens for user ${userId}`);
      
      const updateOps: any = {
        $pull: { fcmTokens: { $in: invalidTokens } }
      };
      
      // If the legacy token was invalid, unset it
      if (user.fcmToken && invalidTokens.includes(user.fcmToken)) {
        updateOps.$unset = { fcmToken: '' };
      }
      
      await db.collection('users').updateOne(
        { _id: user._id },
        updateOps
      );
    }

    return { 
      success: true, 
      sent: batchResponse.successCount, 
      failed: batchResponse.failureCount 
    };

  } catch (error) {
    console.error('🔥 Error sending push notification:', error);
    return { success: false, error };
  }
}

/**
 * Internal helper to send notifications for common events
 */
export const pushTriggers = {
  // Booking status changes
  bookingUpdate: (userId: string, monkName: string, status: string, date: string, time: string) => {
    const isApproved = status === 'confirmed';
    return sendPushNotification(userId, {
      title: isApproved ? 'Захиалга баталгаажлаа' : 'Захиалга цуцлагдлаа',
      body: isApproved 
        ? `${monkName} таны ${date}-ны ${time} цагийн захиалгыг баталгаажууллаа.`
        : `${monkName} таны захиалгыг цуцаллаа.`,
      data: { type: 'booking', status }
    });
  },

  // New message
  newMessage: (userId: string, senderName: string, text: string, senderId: string) => {
    return sendPushNotification(userId, {
      title: `${senderName}-аас шинэ мессеж`,
      body: text.length > 50 ? text.substring(0, 47) + '...' : text,
      data: { type: 'message', senderId }
    });
  },

  // Monk application approval
  monkApproved: (userId: string) => {
    return sendPushNotification(userId, {
      title: 'Баяр хүргэе!',
      body: 'Таны лам болох хүсэлт зөвшөөрөгдлөө. Та одоо хуваариа тохируулах боломжтой.',
      data: { type: 'system', action: 'monk_setup' }
    });
  }
};
