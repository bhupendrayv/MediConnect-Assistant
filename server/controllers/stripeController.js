let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sk_test_placeholder')) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
} catch (error) {
    console.error('Stripe initialization failed:', error.message);
}

const Appointment = require('../models/Appointment');

const createStripeSessionController = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(200).send({
                success: false,
                isMock: true,
                message: "Stripe API key is not configured or invalid on the server",
            });
        }

        const { appointmentId, amount, doctorName } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: "Appointment not found",
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Appointment with Dr. ${doctorName || appointment.doctorInfo?.name || 'Specialist'}`,
                            description: `Appointment Code: ${appointment.appointmentCode}`,
                        },
                        unit_amount: Math.round(Number(amount || appointment.totalAmount) * 100), // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${frontendUrl}/payments?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
            cancel_url: `${frontendUrl}/appointments`,
            metadata: {
                appointmentId: appointmentId.toString(),
                appointmentCode: appointment.appointmentCode
            },
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',
                },
            },
        });

        res.status(200).send({
            success: true,
            message: "Stripe session created successfully",
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).send({
            success: false,
            message: "Error creating Stripe payment session",
            error: error.message,
        });
    }
};

const verifyStripePaymentController = async (req, res) => {
    try {
        const { sessionId, appointmentId } = req.body;

        if (!stripe) {
            // Mock confirmation for testing if Stripe secret is not configured
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, {
                    paymentStatus: 'paid',
                    status: 'approved'
                });
            }
            return res.status(200).send({
                success: true,
                message: "Payment verified (Demo Mode)",
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            await Appointment.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                status: 'approved',
                stripeSessionId: sessionId,
            });

            res.status(200).send({
                success: true,
                message: "Payment verified and appointment confirmed",
            });
        } else {
            res.status(400).send({
                success: false,
                message: "Payment could not be verified",
            });
        }
    } catch (error) {
        console.error('Error verifying Stripe payment:', error);
        res.status(500).send({
            success: false,
            message: "Error verifying Stripe payment",
            error: error.message,
        });
    }
};

module.exports = { createStripeSessionController, verifyStripePaymentController };
