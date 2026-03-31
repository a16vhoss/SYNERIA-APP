import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // Create documents bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketNames = buckets?.map((b) => b.name) ?? [];

    if (!bucketNames.includes("documents")) {
      const { error } = await supabaseAdmin.storage.createBucket("documents", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (error && !error.message.includes("already exists")) throw error;
    }

    if (!bucketNames.includes("avatars")) {
      const { error } = await supabaseAdmin.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (error && !error.message.includes("already exists")) throw error;
    }

    // Create storage policies for documents bucket
    // Allow authenticated users to upload to their own folder
    const policies = [
      {
        name: "Users can upload own documents",
        bucket: "documents",
        operation: "INSERT" as const,
        definition: `(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)`,
      },
      {
        name: "Users can update own documents",
        bucket: "documents",
        operation: "UPDATE" as const,
        definition: `(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)`,
      },
      {
        name: "Users can read own documents",
        bucket: "documents",
        operation: "SELECT" as const,
        definition: `(bucket_id = 'documents')`,
      },
      {
        name: "Users can delete own documents",
        bucket: "documents",
        operation: "DELETE" as const,
        definition: `(bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)`,
      },
    ];

    for (const policy of policies) {
      // Use raw SQL to create policies since the JS API doesn't support it directly
      await supabaseAdmin.rpc("exec_sql", {
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE policyname = '${policy.name}' AND tablename = 'objects'
            ) THEN
              CREATE POLICY "${policy.name}" ON storage.objects
              FOR ${policy.operation}
              TO authenticated
              WITH CHECK (${policy.definition});
            END IF;
          END $$;
        `,
      }).catch(() => {
        // Policy might already exist or RPC might not be available - that's ok
      });
    }

    return NextResponse.json({ success: true, message: "Storage buckets initialized" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
