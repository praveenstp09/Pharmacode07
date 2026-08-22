import Contact from '../models/Contact.js';
import { sendStudentQueryNotification } from '../utils/emailNotifier.js';

// @desc    Submit a contact message / support inquiry
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const contact = await Contact.create({
      name,
      email,
      mobile: mobile || '',
      subject,
      message,
    });

    // Send asynchronous email notification to admin (non-blocking)
    sendStudentQueryNotification(contact).catch(err => {
      console.error('Email notify background error:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
