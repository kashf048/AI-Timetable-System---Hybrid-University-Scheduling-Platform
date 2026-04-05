import { getDb, createAuditLog } from "./db";
import { emailNotifications } from "../drizzle/schema";

interface EmailNotificationPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  type: "schedule_generated" | "conflict_detected" | "schedule_changed" | "optimization_complete";
  relatedEntityType?: string;
  relatedEntityId?: number;
}

/**
 * Queue an email notification for sending
 */
export async function queueEmailNotification(payload: EmailNotificationPayload) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return null;
  }

  try {
    const result = await db.insert(emailNotifications).values({
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName || null,
      subject: payload.subject,
      body: payload.body,
      type: payload.type,
      relatedEntityType: payload.relatedEntityType || null,
      relatedEntityId: payload.relatedEntityId || null,
      status: "pending",
      sentAt: null,
      failureReason: null,
    } as any);

    await createAuditLog({
      action: "EMAIL_QUEUED",
      entityType: "emailNotification",
      changes: { recipient: payload.recipientEmail },
    });

    return result;
  } catch (error) {
    console.error("[Notifications] Failed to queue email:", error);
    throw error;
  }
}

/**
 * Send scheduled notifications (mock implementation)
 * In production, this would integrate with an email service like SendGrid, AWS SES, etc.
 */
export async function sendPendingNotifications() {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return;
  }

  try {
    // Get pending notifications
    const pending = await db
      .select()
      .from(emailNotifications)
      .where(eq(emailNotifications.status, "pending"))
      .limit(10);

    for (const notification of pending) {
      try {
        // Mock email sending - in production, call actual email service
        console.log(`[Email] Sending to ${notification.recipientEmail}:`);
        console.log(`  Subject: ${notification.subject}`);
        console.log(`  Body: ${notification.body}`);

        // Update status to sent
        await db
          .update(emailNotifications)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(emailNotifications.id, notification.id));

        await createAuditLog({
          action: "EMAIL_SENT",
          entityType: "emailNotification",
          entityId: notification.id,
          changes: { recipient: notification.recipientEmail },
        });
      } catch (error) {
        // Mark as failed
        await db
          .update(emailNotifications)
          .set({
            status: "failed",
            failureReason: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(emailNotifications.id, notification.id));

        await createAuditLog({
          action: "EMAIL_FAILED",
          entityType: "emailNotification",
          entityId: notification.id,
          changes: { error: error instanceof Error ? error.message : "Unknown error" },
        });
      }
    }
  } catch (error) {
    console.error("[Notifications] Failed to send pending notifications:", error);
  }
}

/**
 * Notify instructors about schedule changes
 */
export async function notifyInstructorsAboutSchedule(
  instructorEmails: string[],
  timetableName: string,
  changeDescription: string
) {
  const notifications = instructorEmails.map((email) => ({
    recipientEmail: email,
    subject: `Schedule Update: ${timetableName}`,
    body: `Your teaching schedule has been updated.\n\n${changeDescription}\n\nPlease review the updated timetable in the system.`,
    type: "schedule_changed" as const,
  }));

  for (const notification of notifications) {
    await queueEmailNotification(notification);
  }
}

/**
 * Notify about conflict detection
 */
export async function notifyAboutConflicts(
  recipientEmail: string,
  conflictCount: number,
  timetableName: string
) {
  await queueEmailNotification({
    recipientEmail,
    subject: `Scheduling Conflicts Detected: ${timetableName}`,
    body: `${conflictCount} scheduling conflict(s) have been detected in the timetable "${timetableName}".\n\nPlease review and resolve these conflicts to ensure a valid schedule.`,
    type: "conflict_detected",
  });
}

/**
 * Notify about successful schedule generation
 */
export async function notifyScheduleGenerated(
  recipientEmail: string,
  timetableName: string,
  score: number
) {
  await queueEmailNotification({
    recipientEmail,
    subject: `Schedule Generated: ${timetableName}`,
    body: `Your timetable "${timetableName}" has been successfully generated.\n\nSchedule Quality Score: ${score.toFixed(2)}/100\n\nReview the schedule and make any necessary adjustments.`,
    type: "schedule_generated",
  });
}

// Import eq for where clauses
import { eq } from "drizzle-orm";
