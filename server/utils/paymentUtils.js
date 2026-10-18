const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Generates a unique 6-digit transaction ID with a given prefix.
 * Example: C482913 or O736201
 * @param {string} method - 'cash' or 'online'
 * @returns {Promise<string>}
 */
const generateUniqueTransactionId = async (method) => {
    const prefix = method === 'cash' ? 'C' : 'O';
    let isUnique = false;
    let newId = '';

    while (!isUnique) {
        const digits = Math.floor(100000 + Math.random() * 900000); // 6 digits
        newId = `${prefix}${digits}`;

        // Check against database
        const existing = await Appointment.findOne({ transactionId: newId });
        if (!existing) {
            isUnique = true;
        }
    }

    return newId;
};

/**
 * Completes a payment, generating a unified transaction ID and notifying the user.
 * @param {string} appointmentId - The ID of the appointment
 * @param {string} method - 'cash' or 'online'
 * @param {Object} extraDetails - Extra fields like approvedBy, stripePaymentIntentId, stripeSessionId
 * @returns {Promise<Object>} The updated appointment
 */
const completePayment = async (appointmentId, method, extraDetails = {}) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Only generate a new ID if it doesn't already have a standard one
    let transactionId = appointment.transactionId;
    if (!transactionId || transactionId.startsWith('pi_') || transactionId.startsWith('cs_') || transactionId.startsWith('CASH-')) {
        transactionId = await generateUniqueTransactionId(method);
    }

    appointment.paymentStatus = 'paid';
    appointment.paymentMethod = method === 'cash' ? 'cash' : 'online';
    appointment.transactionId = transactionId;
    appointment.paidAt = new Date();
    
    // Auto-approve appointment if pending
    if (appointment.status === 'pending') {
        appointment.status = 'approved';
    }

    // Assign extra fields if provided
    if (extraDetails.approvedBy) {
        appointment.approvedBy = extraDetails.approvedBy;
    }
    if (extraDetails.stripePaymentIntentId) {
        appointment.stripePaymentIntentId = extraDetails.stripePaymentIntentId;
    }
    if (extraDetails.stripeSessionId) {
        appointment.stripeSessionId = extraDetails.stripeSessionId;
    }

    await appointment.save();

    // Trigger shared notification
    const patientUser = await User.findById(appointment.userId);
    if (patientUser) {
        if (!patientUser.unseenNotifications) {
            patientUser.unseenNotifications = [];
        }

        const methodName = method === 'cash' ? '💵 Cash' : '💳 Online';
        const msgAmount = appointment.totalAmount || appointment.doctorInfo?.feesPerConsultation || 500;
        const msgApproved = extraDetails.approvedBy ? ` (verified by ${extraDetails.approvedBy})` : '';

        patientUser.unseenNotifications.push({
            type: 'payment-confirmed',
            message: `${methodName} payment of ₹${msgAmount} confirmed${msgApproved} for appointment ${appointment.appointmentCode}. Your verified receipt is now available (Ref: ${transactionId}).`,
            data: {
                appointmentId: appointment._id,
                appointmentCode: appointment.appointmentCode
            },
            onClickPath: '/payments',
            createdAt: new Date()
        });

        await patientUser.save();
    }

    return appointment;
};

module.exports = {
    completePayment
};
