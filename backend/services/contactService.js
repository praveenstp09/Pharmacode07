import Contact from '../models/Contact.js';
import { sendStudentQueryNotification } from '../utils/emailNotifier.js';
import AppError from '../utils/AppError.js';

export const createContactInquiry = async ({ name, email, mobile, subject, message }) => {
  if (!name || !email || !subject || !message) {
    throw new AppError('Please provide all required fields', 400);
  }

  const contact = await Contact.create({
    name: String(name).trim().slice(0, 100),
    email: String(email).toLowerCase().trim(),
    mobile: mobile ? String(mobile).trim().slice(0, 15) : '',
    subject: String(subject).trim().slice(0, 200),
    message: String(message).trim().slice(0, 5000),
  });

  // Send asynchronous email notification to admin (non-blocking)
  sendStudentQueryNotification(contact).catch(err => {
    console.error('Email notify background error:', err.message);
  });

  return contact;
};
