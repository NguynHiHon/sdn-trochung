const bookingService = require('../services/bookingService');
const socketService = require('../services/socketService');

const extractBookingCode = (tx) => {
    const direct = String(tx?.code || '').trim().toUpperCase();
    if (direct) return direct;

    const content = String(tx?.transaction_content || tx?.transferContent || tx?.description || '').toUpperCase();
    const match = content.match(/OXA[A-Z0-9]{10}|OXA-\d{4}-\d{6}/);
    return match ? match[0] : '';
};

const sepayWebhook = async (req, res) => {
    try {
        const payload = req.body;
        const transactions = Array.isArray(payload) ? payload : [payload];

        let updatedCount = 0;

        for (const tx of transactions) {
            const amountIn = parseFloat(tx?.transferAmount || tx?.amount_in || tx?.amountIn || 0);
            if (!Number.isFinite(amountIn) || amountIn <= 0) continue;

            // SePay thường có transferType=in cho tiền vào
            if (tx?.transferType && String(tx.transferType).toLowerCase() !== 'in') continue;

            const bookingCode = extractBookingCode(tx);
            if (!bookingCode) continue;

            const txId = tx?.id || tx?.transaction_id || tx?.reference || tx?.ref || null;

            // Update booking paid if it matches amount + state
            // eslint-disable-next-line no-await-in-loop
            const updatedBooking = await bookingService.markPaidBySepayWebhook({
                bookingCode,
                amountIn,
                txId,
            });

            if (updatedBooking) {
                updatedCount += 1;

                // Emit realtime event to the QR payment room (room name = bookingCode)
                socketService.emitToBookingRoom(bookingCode, 'paymentSuccess', {
                    bookingCode,
                    amount: amountIn,
                    status: 'PAID',
                    paidAt: new Date(),
                });

                // Optional: notify admins/staff role rooms
                socketService.emitToAdmins('bookingPaymentUpdated', {
                    bookingCode,
                    amount: amountIn,
                    status: 'PAID',
                });
                socketService.emitToTourRoom(updatedBooking.tourId, 'bookingPaymentUpdated', {
                    bookingCode,
                    amount: amountIn,
                    status: 'PAID',
                });
            }
        }

        return res.status(200).json({ success: true, message: 'Webhook processed', updatedCount });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    sepayWebhook,
};
