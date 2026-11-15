const Notification = require('../models/Notification');

/**
 * Creates and logs persistent in-app notifications.
 */
const createNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  jobId = null,
  applicationId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedJob: jobId,
      relatedApplication: applicationId,
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Service Error]:`, error.message);
    return null;
  }
};

module.exports = { createNotification };