// Supabase Edge Function — notify-admin-payment
//
// Called from the Next.js server action (notifyAdminOfModulePayment / notifyAdminOfPayment)
// after a student clicks "Notify Admin" on the checkout page.
//
// Sends an email to the admin(s) so they know a student paid — even if they aren't logged in.
//
// REQUIRED ENV VARS (set in Supabase Dashboard → Settings → Edge Functions → Secrets):
//   SMTP_HOST=smtp.supabase.io
//   SMTP_PORT=465
//   SMTP_USER=your-smtp-username
//   SMTP_PASS=your-smtp-password
//   SMTP_FROM=Wings Academy <results@wingsacademy.ae>

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const FROM_EMAIL = "Wings Academy <results@wingsacademy.ae>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentPayload {
  studentName: string;
  studentEmail: string;
  moduleName: string;
  amount: number;
  transactionId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: PaymentPayload = await req.json();
    const { studentName, studentEmail, moduleName, amount, transactionId } =
      payload;

    if (!studentName || !moduleName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Fetch admin emails from the database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: admins, error: adminError } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("role", "admin");

    if (adminError || !admins || admins.length === 0) {
      console.warn("No admin emails found:", adminError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "No admin emails found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const adminEmails = admins.map((a: any) => a.email).filter(Boolean);

    if (adminEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Admin emails are empty" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Build the email HTML
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 32px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:#0f172a;padding:40px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Wings Academy</h1>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;font-weight:600;">Payment Verification Required</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 24px;">New Payment Notification</p>

      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 32px;">
        A student has completed payment via Ziina and is waiting for module access to be unlocked.
      </p>

      <!-- Payment Details Card -->
      <div style="background:#f1f5f9;border-radius:16px;padding:24px;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Student</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${studentName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Email</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${studentEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Module</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${moduleName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Amount</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">AED ${amount}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Reference</td>
            <td style="padding:8px 0;color:#6366f1;font-size:13px;font-weight:700;text-align:right;font-family:monospace;">${transactionId}</td>
          </tr>
        </table>
      </div>

      <!-- Action Required -->
      <div style="border-left:4px solid #f59e0b;padding:16px 20px;background:#fffbeb;border-radius:0 12px 12px 0;margin-bottom:32px;">
        <p style="color:#92400e;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Action Required</p>
        <p style="color:#78350f;font-size:14px;line-height:1.7;margin:0;">
          Please verify this payment on your Ziina dashboard and grant module access from the student's profile page in the admin panel.
        </p>
      </div>

      <a href="https://wings-academy-mock-test-project.vercel.app/admin/users" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:900;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
        Open Admin Panel →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Wings Academy · UAE Aviation Training</p>
      <p style="color:#cbd5e1;font-size:11px;margin:4px 0 0;">This is an automated notification from the Wings Academy platform.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send via SMTP
    const smtpHost = Deno.env.get("SMTP_HOST") ?? "";
    if (!smtpHost) {
      console.warn(
        "SMTP_HOST is not set — email not sent. Add SMTP_* vars in Supabase Edge Function secrets."
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "SMTP not configured",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") ?? "465");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: Deno.env.get("SMTP_USER") ?? "",
        pass: Deno.env.get("SMTP_PASS") ?? "",
      },
    });

    await transporter.sendMail({
      from: Deno.env.get("SMTP_FROM") ?? FROM_EMAIL,
      to: adminEmails,
      subject: `💰 Payment Received — ${studentName} for ${moduleName}`,
      html: htmlBody,
    });

    console.log(`Payment email sent to ${adminEmails.join(", ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${adminEmails.join(", ")}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
