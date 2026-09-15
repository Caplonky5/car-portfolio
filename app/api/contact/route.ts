import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend client (singleton pattern)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST handler for contact form submissions
 * Sends email to configured CONTACT_EMAIL_TO
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const payload = await request.json();

    // Validate required fields
    if (!payload.name || !payload.email || !payload.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }

    const { name, email, message, carType = null, eventType = null } = payload;
    const contactEmailTo = process.env.CONTACT_EMAIL_TO;

    if (!contactEmailTo) {
      console.error('CONTACT_EMAIL_TO environment variable is not configured');
      return NextResponse.json(
        { error: 'Email configuration missing' },
        { status: 500 }
      );
    }

    // Build email subject and body
    const subject = `Contact from ${name} - ${carType || 'General Inquiry'}`;

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${carType ? `<p><strong>Car Type:</strong> ${carType}</p>` : ''}
        ${eventType ? `<p><strong>Event Type:</strong> ${eventType}</p>` : ''}
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 16px 0;">${message}</blockquote>
        <p><em>Submitted via car-portfolio website</em></p>
        <p style="margin-top: 20px; color: #64748b; font-size: 12px;">
          Received at: ${new Date().toISOString()}
        </p>
      </div>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'contact@shiftautography.com',
      to: contactEmailTo,
      subject,
      html: body,
      replyTo: email,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 502 }
      );
    }

    console.log(`Email sent successfully: ${data?.id}`);
    const duration = Date.now() - startTime;
    console.log(`Contact form processed in ${duration}ms`);

    return NextResponse.json(
      { success: true, emailId: data?.id, message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Contact form error after ${duration}ms:`, error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { status: 'ok', service: 'contact-api' },
    { status: 200 }
  );
}