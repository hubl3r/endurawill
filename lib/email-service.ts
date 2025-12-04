import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDelegateInvitation(
  toEmail: string,
  delegateName: string,
  inviterName: string,
  estateName: string,
  invitationToken: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitationToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'EnduraWill <invitations@endurawill.com>',
      to: [toEmail],
      subject: `${inviterName} has invited you to access ${estateName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Estate Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">EnduraWill</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Estate Planning Made Simple</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">You've Been Invited</h2>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
                <strong>${inviterName}</strong> has invited you to access <strong>${estateName}</strong> on EnduraWill.
              </p>
              
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">
                As a trusted delegate, you'll be able to access important estate information and documents as specified by the estate owner.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
                This invitation will expire in 7 days. If you don't want to accept this invitation, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} EnduraWill. All rights reserved.</p>
              <p style="margin: 5px 0;">
                <a href="https://endurawill.com" style="color: #2563eb; text-decoration: none;">Visit our website</a> • 
                <a href="https://endurawill.com/privacy" style="color: #2563eb; text-decoration: none;">Privacy Policy</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
${inviterName} has invited you to access ${estateName}

You've been invited to become a trusted delegate for ${estateName}. As a delegate, you'll be able to access important estate information and documents as specified by the estate owner.

Accept your invitation by visiting:
${inviteUrl}

This invitation will expire in 7 days.

If you don't want to accept this invitation, you can safely ignore this email.

---
© ${new Date().getFullYear()} EnduraWill
https://endurawill.com
      `.trim(),
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error };
  }
}
