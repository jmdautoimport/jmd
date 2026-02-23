export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in .env");
  }

  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const fromName = process.env.EMAIL_FROM_NAME || "JDM Auto Imports";
  const from = `"${fromName}" <${fromEmail}>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html: html || text.replace(/\n/g, "<br>"),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Email Error: Failed to send via Resend.");
    throw error;
  }
}

export function generateInquiryEmailContent(data: any) {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    notes, 
    carName, 
    carId,
    address,
    budget,
    modelPreference,
    yearRange
  } = data;
  
  const title = carId ? `New Car Inquiry: ${carName}` : (carName === "Concierge Request" ? "New Concierge Request" : "New General Contact Inquiry");
  
  const text = `
    You have a new inquiry from your website:
    
    Name: ${firstName} ${lastName}
    Email: ${email}
    Phone: ${phone || "Not provided"}
    Type: ${carId ? "Vehicle Inquiry" : (carName === "Concierge Request" ? "Concierge / Find Me a Car" : "General Contact")}
    ${carName && carName !== "Concierge Request" ? `Subject: ${carName}` : ""}
    
    ${address ? `Address: ${address}` : ""}
    ${budget ? `Budget: ${budget}` : ""}
    ${modelPreference ? `Model Preference: ${modelPreference}` : ""}
    ${yearRange ? `Year Range: ${yearRange}` : ""}
    
    Message/Notes:
    ${notes || "No additional notes provided."}
  `;
  
  return { title, text };
}

export function generateBookingEmailContent(data: any) {
  const { 
    firstName, 
    lastName, 
    fullName,
    email, 
    phone, 
    phoneNumber,
    serviceType, 
    date, 
    inspectionDate,
    time, 
    inspectionTime,
    notes,
    carName
  } = data;
  
  const displayFirstName = firstName || (fullName ? fullName.split(" ")[0] : "Unknown");
  const displayLastName = lastName || (fullName ? fullName.split(" ").slice(1).join(" ") : "-");
  const displayPhone = phone || phoneNumber || "Not provided";
  const displayDate = date || inspectionDate || "Not provided";
  const displayTime = time || inspectionTime || "Not provided";
  const displayService = serviceType || (carName ? `Inspection: ${carName}` : "Booking Request");

  const title = `New Booking Request: ${displayService}`;
  
  const text = `
    You have a new booking request:
    
    Name: ${displayFirstName} ${displayLastName}
    Email: ${email}
    Phone: ${displayPhone}
    Service: ${displayService}
    Date: ${displayDate}
    Time: ${displayTime}
    
    Additional Info:
    ${notes || "No additional notes provided."}
  `;
  
  return { title, text };
}
