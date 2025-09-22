import User from '#models/user'
import env from '#start/env'
import NotificationService from '#services/notification_service'

const notificationService = new NotificationService()

// Notification templates
export const organizationProfileApproved = {
  notification: {
    title: 'Organization Profile Approved ✅',
    body: 'Your organization profile has been successfully approved. Tap to view details.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard`,
  },
}

export const organizationProfileRejected = {
  notification: {
    title: 'Organization Profile Rejected ❌',
    body: 'Your organization profile has been rejected due to !!reason!!. Please review and resubmit.',
  },
  data: {
    link: `${env.get('WEB_URL')}`,
  },
}

export const staffProfileApproved = {
  notification: {
    title: 'Staff Approved ✅',
    body: 'Your staff profile has been successfully approved.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/manage-staff`,
  },
}

export const staffProfileRejected = {
  notification: {
    title: 'Staff Profile Rejected ❌',
    body: 'Your staff profile has been rejected. Please review and resubmit.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/manage-staff`,
  },
}

export const organizationPaymentComplete = {
  notification: {
    title: 'Payment Successful 💳',
    body: 'Your organization payment has been processed successfully.',
  },
  data: {
    link: `${env.get('WEB_URL')}`,
  },
}

export const candidatePaymentComplete = {
  notification: {
    title: 'Payment Confirmed 💰',
    body: 'Your payment has been completed successfully. Thank you!',
  },
  data: {
    link: `${env.get('WEB_URL')}`,
  },
}
export const staffPaymentComplete = {
  notification: {
    title: 'Payment Confirmed 💰',
    body: 'Your payment has been completed successfully. Thank you!',
  },
  data: {
    link: `${env.get('WEB_URL')}`,
  },
}
export const paymentDeclined = {
  notification: {
    title: 'Payment Declined 💳',
    body: 'Your payment could not be processed. Please check your payment method and try again.',
  },
  data: {
    link: `${env.get('WEB_URL')}`,
  },
}

export const studentEnrollmentCompleted = {
  notification: {
    title: 'Enrollment Complete 🎓',
    body: 'You have been successfully enrolled in the training program.',
  },
  data: {
    link: `${env.get('WEB_URL')}/candidate/my-trainings`,
  },
}

export const studentEnrollmentRejected = {
  notification: {
    title: 'Enrollment Rejected ❌',
    body: 'Your enrollment in the training program has been rejected. Please review and resubmit.',
  },
  data: {
    link: `${env.get('WEB_URL')}/candidate/my-trainings`,
  },
}

export const studentEnrollmentResubmitted = {
  notification: {
    title: 'Enrollment Application Resubmission Received 🔄',
    body: 'An enrollment application has been resubmitted for your review and approval.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/enrollments/requests`,
  },
}

export const applicationApproved = {
  notification: {
    title: 'Application Approved ✅',
    body: 'Congratulations! Your application has been approved.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/applications?status=approved`,
  },
}

export const applicationRejected = {
  notification: {
    title: 'Application Update ❌',
    body: 'Your application was not approved because of !!reason!!. Check the details section for more information.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/applications?status=rejected`,
  },
}

export const announcementApproved = {
  notification: {
    title: 'Announcement Published ✅',
    body: 'Your announcement has been approved and is now live.',
  },
  data: {
    link: `${env.get('WEB_URL')}/announcements`,
  },
}

export const announcementRejected = {
  notification: {
    title: 'Announcement Rejected ❌',
    body: 'Your announcement has been rejected. Please review and resubmit. Reason: !!reason!!',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/announcement`,
  },
}

export const applicationResubmitted = {
  notification: {
    title: 'Application Resubmitted 🔄',
    body: 'Your application has been resubmitted for approval and is under review.',
  },
  data: {
    link: `${env.get('WEB_URL')}/applications`,
  },
}

export const itemPendingApproval = {
  notification: {
    title: 'Approval Required 🔔',
    body: 'An item is pending your approval. Please review when convenient.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/approval-system`,
  },
}

export const itemResubmittedApproval = {
  notification: {
    title: 'Approval Item Resubmitted 🔔',
    body: 'An item has been resubmitted and is awaiting your review.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/approval-system`,
  },
}

export const enrollmentItemPendingApproval = {
  notification: {
    title: 'An enrollment item is pending for your approval 🔔',
    body: 'A new candidate has enrolled in the training program. An item is awaiting your approval. Kindly review it at your earliest convenience.',
  },
  data: {
    link: `${env.get('WEB_URL')}/dashboard/enrollments/requests`,
  },
}

const staffApprovedNotification = async (user: User): Promise<void> => {
  await notificationService.createUserNotification(user.id, {
    title: staffProfileApproved.notification.title,
    message: staffProfileApproved.notification.body,
    type: 'success',
    metadata: staffProfileApproved.data,
  })
}

export default {
  staffApprovedNotification,
}
