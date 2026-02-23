import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create a transporter using environment variables
// This can be configured for Gmail, Outlook, SendGrid, etc.
export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // 1. Validate configuration
  const config = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };

  // Gmail-specific and Port-specific logic
  const isGmail = config.host.includes("gmail.com");
  const isSSLPort = config.port === 465;
  const secure = isSSLPort || (process.env.EMAIL_SECURE === "true" && !isGmail);

  if (!config.user || !config.pass) {
    console.error("Email Error: EMAIL_USER or EMAIL_PASS is missing in .env");
    return;
  }

  // 2. Create transporter on-demand to ensure it has latest env vars
   const transporter = nodemailer.createTransport({
     host: config.host,
     port: config.port,
     secure: secure,
     auth: {
       user: config.user,
       pass: config.pass,
     },
     tls: {
       // Do not fail on invalid certs
       rejectUnauthorized: false,
       // Force TLS version if needed
       minVersion: 'TLSv1.2'
     }
   });

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'JDM Auto Imports'}" <${config.user}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });

    return info;
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.error("Email Error: Authentication failed. Please check credentials.");
    } else {
      console.error("Email Error: Failed to send email.");
    }
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
