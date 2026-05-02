import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { guestId, guestName, guestEmail, attending } = await request.json();

    const rsvpUrl = `https://destinyandstace.com/rsvp?id=${guestId}`;
    const detailsUrl = "https://destinyandstace.com"; // Or just "https://destinyandstace.com"
    const logoUrl = "https://destinyandstace.com/img/logo.png";

    
    // Logic to determine if this is a first-time invite or a confirmation receipt
    const isInitialInvite = attending === undefined || attending === null;
const buttonUrl = isInitialInvite ? rsvpUrl : detailsUrl;
const buttonText = isInitialInvite ? "Confirm RSVP" : "Check out our Website!";
    const data = await resend.emails.send({
      from: 'The Hamilton Wedding <hello@destinyandstace.com>',
      to: [guestEmail],
      // Only CC yourself on actual RSVP responses, not the initial blast
      cc: isInitialInvite ? [] : ['stacehamilton@gmail.com'], 
      subject: isInitialInvite 
        ? "You're Invited: The Hamilton Wedding" 
        : (attending ? "We can't wait to celebrate with you!" : "We'll miss you at the wedding!"),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Hamilton Wedding Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8eb; font-family: Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf8eb; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <table border="0" cellpadding="0" cellspacing="0" width="450" style="background-color: #faf8eb; border: 1px solid #333333; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="${logoUrl}" width="180" alt="Destiny & Stace" style="display: block;">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <h1 style="color: #253225; font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px; line-height: 1.1;">
                The Hamilton<br>
                <span style="font-weight: 200; opacity: 0.8;">Wedding</span>
              </h1>
              
              <p style="color: #253225; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin: 20px 0 10px 0;">
                September 5, 2026 • Campio Ritchie
              </p>

              ${!isInitialInvite ? `
              <div style="margin: 25px 0; padding: 15px; border-top: 1px solid #333; border-bottom: 1px solid #333;">
                <p style="color: #d0006f; font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0;">
                  RSVP Status: ${attending ? "✅ Attending" : "❌ Declined"}
                </p>
              </div>
              ` : ''}
              
              <p style="color: #4d4d4d; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Hi ${guestName},<br><br>
                ${isInitialInvite 
                  ? "We would love for you to join us for our intimate celebration. Please confirm your attendance via the link below."
                  : (attending 
                      ? "We are so excited to have you join us for our intimate celebration! We'll keep you updated with more details as we get closer." 
                      : "We're sorry you can't make it, but we appreciate you letting us know. We'll find another time to celebrate soon!")
                }
              </p>

              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#d0006f" style="border-radius: 16px;">
                  <a 
  href="${isInitialInvite ? rsvpUrl : 'https://destinyandstace.com'}" 
  target="_blank" 
  style="padding: 18px 36px; font-size: 12px; color: #ffffff; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; display: inline-block;"
>
  ${isInitialInvite ? "Confirm RSVP" : "Check out our Website!"}
</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table border="0" cellpadding="0" cellspacing="0" width="450">
          <tr>
            <td align="center" style="padding: 30px; color: #444444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
              With Love, Destiny & Stace
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}