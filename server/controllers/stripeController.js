const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const appointmentModel = require('../models/Appointment');

const createStripeSessionController = async (req, res) => {
    try {
        const { appointmentId, amount } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: "Appointment not found",
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Appointment with Dr. ${req.body.doctorName || 'Specialist'}`,
                            description: `Appointment ID: ${appointmentId}`,
                        },
                        unit_amount: amount * 100, // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payments?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/appointments`,
            metadata: {
                appointmentId: appointmentId,
            },
            // Disable Stripe Link to skip phone number verification screen
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',
                },
            },
        });

        res.status(200).send({
            success: true,
            message: "Stripe session created",
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating Stripe session",
            error,
        });
    }
};

const verifyStripePaymentController = async (req, res) => {
    try {
        const { sessionId, appointmentId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                stripeSessionId: sessionId,
            });
            res.status(200).send({
                success: true,
                message: "Payment verified and appointment updated",
            });
        } else {
            res.status(400).send({
                success: false,
                message: "Payment not verified",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error verifying Stripe payment",
            error,
        });
    }
};

module.exports = { createStripeSessionController, verifyStripePaymentController };
