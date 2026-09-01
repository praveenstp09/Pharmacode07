import * as contactService from '../services/contactService.js';

export const submitContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContactInquiry(req.body);
    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
