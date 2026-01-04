// lib/poa/notifications.ts
// Email notifications for POA agent designation and workflow

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send agent designation email
 * Notifies an agent they've been designated in a POA
 */
export async function sendAgentDesignationEmail(params: {
  agentEmail: string;
  agentName: string;
  principalName: string;
  poaType: string;
  agentType: string;
  acceptUrl: string;
  declineUrl: string;
}) {
  const { agentEmail, agentName, principalName, poaType, agentType, acceptUrl, declineUrl } = params;

  try {
    const result = await resend.emails.send({
      from: 'Endurawill <notifications@endurawill.com>',
      to: agentEmail,
      subject: `You've been designated as ${agentType} agent for ${principalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Power of Attorney Agent Designation</h2>
          
          <p>Hello ${agentName},</p>
          
          <p><strong>${principalName}</strong> has designated you as their <strong>${agentType}</strong> in their <strong>${poaType}</strong> Power of Attorney.</p>
          
          <h3>What does this mean?</h3>
          <p>As an agent, you may be authorized to make financial and legal decisions on behalf of ${principalName} if they become unable to do so themselves.</p>
          
          <h3>Your Response Required</h3>
          <p>Please review the Power of Attorney document and respond:</p>
          
          <div style="margin: 30px 0;">
            <a href="${acceptUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Accept Designation
            </a>
            
            <a href="${declineUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Decline Designation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> This is a significant responsibility. Please carefully consider whether you can fulfill the duties of an agent before accepting.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #999; font-size: 12px;">
            This email was sent by Endurawill on behalf of ${principalName}. If you have questions, please contact them directly.
          </p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending agent designation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send acceptance confirmation to principal
 */
export async function sendAgentAcceptanceConfirmation(params: {
  principalEmail: string;
  principalName: string;
  agentName: string;
  agentType: string;
  acceptedAt: Date;
}) {
  const { principalEmail, principalName, agentName, agentType, acceptedAt } = params;

  try {
    const result = await resend.emails.send({
      from: 'Endurawill <notifications@endurawill.com>',
      to: principalEmail,
      subject: `${agentName} has accepted their agent designation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Agent Acceptance Confirmation</h2>
          
          <p>Hello ${principalName},</p>
          
          <p><strong>${agentName}</strong> has accepted their designation as your <strong>${agentType}</strong>.</p>
          
          <p style="color: #666;">
            <strong>Accepted on:</strong> ${acceptedAt.toLocaleDateString()} at ${acceptedAt.toLocaleTimeString()}
          </p>
          
          <p>Your Power of Attorney is now active with this agent designation confirmed.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from Endurawill.
          </p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending acceptance confirmation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send decline notification to principal
 */
export async function sendAgentDeclineNotification(params: {
  principalEmail: string;
  principalName: string;
  agentName: string;
  agentType: string;
  declineReason?: string;
  declinedAt: Date;
}) {
  const { principalEmail, principalName, agentName, agentType, declineReason, declinedAt } = params;

  try {
    const result = await resend.emails.send({
      from: 'Endurawill <notifications@endurawill.com>',
      to: principalEmail,
      subject: `${agentName} has declined their agent designation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Agent Declined Designation</h2>
          
          <p>Hello ${principalName},</p>
          
          <p><strong>${agentName}</strong> has declined their designation as your <strong>${agentType}</strong>.</p>
          
          <p style="color: #666;">
            <strong>Declined on:</strong> ${declinedAt.toLocaleDateString()} at ${declinedAt.toLocaleTimeString()}
          </p>
          
          ${declineReason ? `
            <p><strong>Reason provided:</strong></p>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 6px;">
              ${declineReason}
            </p>
          ` : ''}
          
          <p style="color: #ef4444; font-weight: bold;">
            ⚠️ Action Required: You may need to designate a different agent for your Power of Attorney.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from Endurawill.
          </p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending decline notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
