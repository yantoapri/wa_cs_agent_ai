import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { message, contactIds, channelId, sessionName, metadata } = body;

    // Validate required fields
    if (!message || !contactIds || !channelId || !sessionName) {
      return {
        error: true,
        message: "message, contactIds, channelId, dan sessionName wajib diisi",
      };
    }

    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    // Get WAHA configuration
    const baseUrl = runtimeConfig.wahaBaseUrl;
    const wahaApiKey = runtimeConfig.wahaApiKey;

    if (!baseUrl || !wahaApiKey) {
      return {
        error: true,
        message: "Wa configuration tidak ditemukan",
      };
    }

    // Get contacts data
    const { data: contacts, error: contactsError } = await client
      .from("contacts")
      .select("phone_number, name")
      .in("id", contactIds);

    if (contactsError || !contacts || contacts.length === 0) {
      return {
        error: true,
        message: "Kontak tidak ditemukan",
      };
    }

    // Validate phone numbers
    const invalidContacts = contacts.filter(
      (contact) => !contact.phone_number || contact.phone_number.trim() === ""
    );
    if (invalidContacts.length > 0) {
      return {
        error: true,
        message: `Kontak berikut tidak memiliki nomor telepon: ${invalidContacts
          .map((c) => c.name)
          .join(", ")}`,
      };
    }

    // Start background processing
    const processBroadcast = async () => {
      console.log(
        `[Broadcast] Starting broadcast to ${contacts.length} contacts`
      );
      console.log(`[Broadcast] Channel: ${channelId}, Session: ${sessionName}`);
      console.log(`[Broadcast] Message: ${message.substring(0, 100)}...`);

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const phoneNumber = contact.phone_number.trim();

        try {
          console.log(
            `[Broadcast] Sending to ${contact.name} (${phoneNumber}) -`
          );

          // Validate phone number format
          if (!phoneNumber.startsWith("62")) {
            console.error(
              `[Broadcast] Invalid phone format for ${contact.name}: ${phoneNumber}`
            );
            failCount++;
            continue;
          }

          // Prepare message body for WAHA
          const messageBody = {
            session: sessionName,
            chatId: phoneNumber + "@c.us",
            text: message,
            metadata: {
              sender_type: "broadcast",
              is_broadcast: true,
              message_type: "broadcast",
              is_manual_broadcast: true,
              ...metadata, // Spread any additional metadata from the request
            },
          };

          console.log(`[Broadcast] Sending message body with metadata:`, {
            session: messageBody.session,
            chatId: messageBody.chatId,
            text: messageBody.text.substring(0, 50) + "...",
            metadata: messageBody.metadata,
          });

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
            `[Broadcast] Successfully sent to ${contact.name}:`,
            wahaResponse
          );
          successCount++;

          // Wait 60 seconds before sending next message (except for the last one)
          if (i < contacts.length - 1) {
            console.log(
              `[Broadcast] Waiting 60 seconds before next message...`
            );
            await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds
          }
        } catch (error) {
          console.error(
            `[Broadcast] Failed to send to ${contact.name}:`,
            error
          );
          failCount++;
          // Continue with next contact even if one fails
        }
      }

      console.log(
        `[Broadcast] Completed sending to ${contacts.length} contacts. Success: ${successCount}, Failed: ${failCount}`
      );
    };

    // Start background processing without blocking the response
    processBroadcast().catch((error) => {
      console.error("[Broadcast] Background processing error:", error);
    });

    return {
      error: false,
      message: `Broadcast dimulai untuk ${contacts.length} kontak. Pesan akan dikirim dengan delay 60 detik antar kontak.`,
      totalContacts: contacts.length,
    };
  } catch (err) {
    console.error("Error in broadcast-send API:", err);
    return {
      error: true,
      message: err.message || "Terjadi kesalahan saat memulai broadcast",
    };
  }
});