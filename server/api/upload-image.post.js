import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event);
    const image = formData.get("image");

    if (!image) {
      return {
        error: true,
        message: "No image file provided",
      };
    }

    // Validate file type
    if (!image.type.startsWith("image/")) {
      return {
        error: true,
        message: "File must be an image",
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return {
        error: true,
        message: "Image size must be less than 10MB",
      };
    }

    // Get Supabase configuration
    const runtimeConfig = useRuntimeConfig();
    const supabase = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = image.name.split(".").pop();
    const fileName = `chat-images/${timestamp}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("chat-images")
      .upload(fileName, image, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);

      // If bucket doesn't exist, try to create it
      if (
        error.message &&
        error.message.includes("bucket") &&
        error.message.includes("not found")
      ) {
        try {
          console.log("Creating chat-images bucket...");
          const { error: bucketError } = await supabase.storage.createBucket(
            "chat-images",
            {
              public: true,
              fileSizeLimit: 52428800, // 50MB
              allowedMimeTypes: [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
              ],
            }
          );

          if (bucketError) {
            console.error("Failed to create bucket:", bucketError);
            return {
              error: true,
              message: "Failed to create storage bucket",
              detail: bucketError.message,
            };
          }

          // Try upload again after creating bucket
          const { data: retryData, error: retryError } = await supabase.storage
            .from("chat-images")
            .upload(fileName, image, {
              contentType: image.type,
              cacheControl: "3600",
              upsert: false,
            });

          if (retryError) {
            console.error("Retry upload error:", retryError);
            return {
              error: true,
              message:
                "Failed to upload image to storage after creating bucket",
              detail: retryError.message,
            };
          }

          // Get public URL for retry upload
          const { data: urlData } = supabase.storage
            .from("chat-images")
            .getPublicUrl(fileName);

          return {
            error: false,
            message: "Image uploaded successfully to Supabase",
            url: urlData.publicUrl,
            filename: fileName,
            size: image.size,
            type: image.type,
          };
        } catch (createError) {
          console.error("Error creating bucket:", createError);
          return {
            error: true,
            message: "Failed to create storage bucket",
            detail: createError.message,
          };
        }
      }

      return {
        error: true,
        message: "Failed to upload image to storage",
        detail: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName);

    return {
      error: false,
      message: "Image uploaded successfully to Supabase",
      url: urlData.publicUrl,
      filename: fileName,
      size: image.size,
      type: image.type,
    };
  } catch (err) {
    console.error("Error uploading image:", err);
    return {
      error: true,
      message: err.message || "Failed to upload image",
    };
  }
});
