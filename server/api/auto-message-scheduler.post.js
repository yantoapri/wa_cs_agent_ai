import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    // Get WAHA configuration
    const baseUrl = runtimeConfig.wahaBaseUrl;
    const wahaApiKey = runtimeConfig.wahaApiKey;

    if (!baseUrl || !wahaApiKey) {
      console.error(
        "[Auto Message Scheduler] WAHA configuration tidak ditemukan"
      );
      return {
        error: true,
        message: "WAHA configuration tidak ditemukan",
      };
    }

    console.log("[Auto Message Scheduler] Starting auto message scheduler...");

    // Get all scheduled auto messages that are due to be sent
    const now = new Date();
    const { data: scheduledMessages, error: fetchError } = await client
      .from("auto_messages")
      .select(
        `
        id,
        title,
        message,
        contact_ids,
        contact_count,
        scheduled_at,
        schedules,
        interval_config,
        status,
        created_by,
        chanel_id
      `
      )
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true });

    if (fetchError) {
      console.error(
        "[Auto Message Scheduler] Error fetching scheduled messages:",
        fetchError
      );
      return {
        error: true,
        message: "Gagal mengambil pesan terjadwal",
      };
    }

    if (!scheduledMessages || scheduledMessages.length === 0) {
      console.log("[Auto Message Scheduler] No scheduled messages to send");
      return {
        error: false,
        message: "Tidak ada pesan terjadwal yang perlu dikirim",
        processed: 0,
      };
    }

    console.log(
      `[Auto Message Scheduler] Found ${scheduledMessages.length} messages to send`
    );

    // Helper function to format time to 24-hour format
    const formatTimeTo24Hour = (timeString) => {
      if (!timeString) return "00:00";

      // If already in 24-hour format, return as is
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
      }

      // Convert from 12-hour to 24-hour format
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      let hour24 = hours;
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === "AM" && hours === 12) {
        hour24 = 0;
      }

      return `${hour24.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    };

    // Helper function to get schedules that are due to be sent
    const getDueSchedules = (message) => {
      const schedules = [];

      // If message has schedules array, use it
      if (message.schedules && Array.isArray(message.schedules)) {
        for (const schedule of message.schedules) {
          if (schedule.date && schedule.time) {
            const scheduleTime = formatTimeTo24Hour(schedule.time);
            const scheduleDateTime = new Date(
              `${schedule.date}T${scheduleTime}`
            );

            // Check if this schedule is due to be sent (within the last 5 minutes)
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            if (scheduleDateTime >= fiveMinutesAgo && scheduleDateTime <= now) {
              schedules.push({
                date: schedule.date,
                time: scheduleTime,
                originalTime: schedule.time,
              });
            }
          }
        }
      } else if (message.scheduled_at) {
        // Fallback to scheduled_at for backward compatibility
        const scheduledAt = new Date(message.scheduled_at);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        if (scheduledAt >= fiveMinutesAgo && scheduledAt <= now) {
          schedules.push({
            date: scheduledAt.toISOString().split("T")[0],
            time: scheduledAt.toTimeString().slice(0, 5),
            originalTime: scheduledAt.toTimeString().slice(0, 5),
          });
        }
      }

      return schedules;
    };

    let successCount = 0;
    let failCount = 0;

    for (const message of scheduledMessages) {
      try {
        console.log(
          `[Auto Message Scheduler] Processing message: ${message.title}`
        );

        // Get schedules that are due to be sent
        const dueSchedules = getDueSchedules(message);

        if (dueSchedules.length === 0) {
          console.log(
            `[Auto Message Scheduler] No schedules due for message: ${message.title}`
          );
          continue;
        }

        console.log(
          `[Auto Message Scheduler] Found ${dueSchedules.length} schedules due for message: ${message.title}`
        );

        // Log schedule details for debugging
        dueSchedules.forEach((schedule, index) => {
          console.log(
            `[Auto Message Scheduler] Schedule ${index + 1}: ${schedule.date} ${
              schedule.time
            } (original: ${schedule.originalTime})`
          );
        });

        // Get channel information
        const { data: channelData, error: channelError } = await client
          .from("chanels")
          .select("session_name, is_active")
          .eq("id", message.chanel_id)
          .single();

        if (channelError || !channelData) {
          console.error(
            `[Auto Message Scheduler] Channel not found for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        if (!channelData.is_active) {
          console.error(
            `[Auto Message Scheduler] Channel inactive for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        if (!channelData.session_name) {
          console.error(
            `[Auto Message Scheduler] No session name for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        // Parse contact_ids to get phone numbers
        const contactIds = [];
        if (Array.isArray(message.contact_ids)) {
          // Handle new format: array of objects with name and phone
          if (
            message.contact_ids.length > 0 &&
            typeof message.contact_ids[0] === "object"
          ) {
            // Extract phone numbers from contact objects
            const phoneNumbers = message.contact_ids
              .map((contact) => contact.phone)
              .filter((phone) => phone && phone.trim() !== "");

            // Get contact IDs from phone numbers
            if (phoneNumbers.length > 0) {
              const { data: contacts } = await client
                .from("contacts")
                .select("id")
                .in("phone_number", phoneNumbers);

              if (contacts) {
                contactIds.push(...contacts.map((c) => c.id));
              }
            }
          } else {
            // Handle old format: array of contact IDs
            contactIds.push(...message.contact_ids);
          }
        }

        if (contactIds.length === 0) {
          console.error(
            `[Auto Message Scheduler] No valid contacts for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        // Get contact phone numbers
        const { data: contacts, error: contactsError } = await client
          .from("contacts")
          .select("phone_number, name")
          .in("id", contactIds);

        if (contactsError || !contacts || contacts.length === 0) {
          console.error(
            `[Auto Message Scheduler] No contacts found for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        // Validate phone numbers
        const validContacts = contacts.filter(
          (contact) =>
            contact.phone_number && contact.phone_number.trim() !== ""
        );

        if (validContacts.length === 0) {
          console.error(
            `[Auto Message Scheduler] No valid phone numbers for message ${message.id}`
          );
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          continue;
        }

        console.log(
          `[Auto Message Scheduler] Sending message to ${validContacts.length} contacts`
        );

        // Send messages with delay
        let sentCount = 0;
        for (let i = 0; i < validContacts.length; i++) {
          const contact = validContacts[i];
          const phoneNumber = contact.phone_number.trim();

          try {
            // Validate phone number format
            if (!phoneNumber.startsWith("62")) {
              console.error(
                `[Auto Message Scheduler] Invalid phone format for ${contact.name}: ${phoneNumber}`
              );
              continue;
            }

            // Prepare message body for WAHA
            const messageBody = {
              session: channelData.session_name,
              chatId: phoneNumber + "@c.us",
              text: message.message,
              metadata: {
                sender_type: "auto_message",
                is_auto_message: true,
                message_type: "scheduled",
                is_scheduled_message: true,
                auto_message_id: message.id,
              },
            };

            console.log(
              `[Auto Message Scheduler] Sending to ${
                contact.name
              } (${phoneNumber}) - ${i + 1}/${validContacts.length}`
            );

            // Send message to WAHA
            const wahaResponse = await $fetch(`${baseUrl}/api/sendText`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": wahaApiKey,
              },
              body: messageBody,
              timeout: 30000, // 30 second timeout
            });

            console.log(
              `[Auto Message Scheduler] Successfully sent to ${contact.name}:`,
              wahaResponse
            );
            sentCount++;

            // Wait 60 seconds before sending next message (except for the last one)
            if (i < validContacts.length - 1) {
              console.log(
                `[Auto Message Scheduler] Waiting 60 seconds before next message...`
              );
              await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds
            }
          } catch (error) {
            console.error(
              `[Auto Message Scheduler] Failed to send to ${contact.name}:`,
              error
            );
            // Continue with next contact even if one fails
          }
        }

        // Update message status
        if (sentCount > 0) {
          await updateMessageStatus(client, message.id, "sent", sentCount);
          successCount++;
          console.log(
            `[Auto Message Scheduler] Message ${message.id} sent successfully to ${sentCount} contacts`
          );
        } else {
          await updateMessageStatus(client, message.id, "failed");
          failCount++;
          console.error(
            `[Auto Message Scheduler] Message ${message.id} failed to send`
          );
        }
      } catch (error) {
        console.error(
          `[Auto Message Scheduler] Error processing message ${message.id}:`,
          error
        );
        await updateMessageStatus(client, message.id, "failed");
        failCount++;
      }
    }

    console.log(
      `[Auto Message Scheduler] Completed. Success: ${successCount}, Failed: ${failCount}`
    );

    return {
      error: false,
      message: `Auto message scheduler completed. Success: ${successCount}, Failed: ${failCount}`,
      processed: scheduledMessages.length,
      success: successCount,
      failed: failCount,
    };
  } catch (error) {
    console.error("[Auto Message Scheduler] Error:", error);
    return {
      error: true,
      message: error.message || "Terjadi kesalahan pada auto message scheduler",
    };
  }
});

// Helper function to update message status
async function updateMessageStatus(
  client,
  messageId,
  status,
  sentCount = null
) {
  try {
    const updateData = {
      status: status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    };

    if (sentCount !== null) {
      updateData.contact_count = sentCount;
    }

    const { error } = await client
      .from("auto_messages")
      .update(updateData)
      .eq("id", messageId);

    if (error) {
      console.error(
        `[Auto Message Scheduler] Error updating message status:`,
        error
      );
    }
  } catch (error) {
    console.error(
      `[Auto Message Scheduler] Error updating message status:`,
      error
    );
  }
}
