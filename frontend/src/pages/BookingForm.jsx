import React, { useState } from 'react';
import { axiosPublic } from '../config/axiosPublic';

const BookingForm = ({ tourId, selectedDate, onBookingSuccess, onCancel }) => {
    const [guests, setGuests] = useState(1);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: '',
        specialRequest: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [holdData, setHoldData] = useState(null);

    const pricePerGuest = 500; // Mock price

    const handleHold = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosPublic.post('/api/booking/hold', {
                userId: 'mock-user-id', // Ideally from Redux auth
                tourId,
                date: selectedDate,
                numberOfGuests: guests,
                totalPrice: guests * pricePerGuest,
                guestInfo,
            });
            if (data.success) {
                setHoldData(data.data);
            } else {
                setError(data.message || 'Failed to hold booking');
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosPublic.post(`/api/booking/confirm/${holdData._id}`, {
                userId: 'mock-user-id',
            });
            if (data.success) {
                onBookingSuccess(data.data);
            } else {
                setError(data.message || 'Failed to confirm booking');
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (holdData) {
        return (
            <div className="p-4 border rounded shadow-sm mt-4 bg-green-50">
                <h3 className="text-xl font-bold text-green-700">Booking Held Successfully!</h3>
                <p className="mt-2 text-sm text-gray-700">We have temporarily reserved your slots for 15 minutes.</p>
                <div className="mt-4">
                    <p><strong>Guests:</strong> {holdData.numberOfGuests}</p>
                    <p><strong>Total Price:</strong> ${holdData.totalPrice}</p>
                    <p><strong>Expires At:</strong> {new Date(holdData.holdExpiresAt).toLocaleTimeString()}</p>
                </div>

                <h4 className="mt-4 font-semibold">Payment Details</h4>
                <p className="text-sm text-gray-600 mb-4">(Mocking payment gateway integration...)</p>

                <div className="flex gap-4">
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Confirming...' : 'Complete Payment & Confirm'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        );
    }

    return (
        <form onSubmit={handleHold} className="p-4 border rounded shadow-sm mt-4">
            <h3 className="text-lg font-bold mb-4">Book Tour for {selectedDate}</h3>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Special Request</label>
                <textarea
                    value={guestInfo.specialRequest}
                    onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })}
                    className="mt-1 block w-full p-2 border rounded"
                    rows="3"
                />
            </div>

            <div className="bg-yellow-50 p-3 rounded mb-4 text-sm">
                <h4 className="font-semibold text-yellow-800">Booking Conditions:</h4>
                <ul className="list-disc pl-5 mt-1 text-yellow-700">
                    <li>Health requirements: Must be moderately fit.</li>
                    <li>Cancellation rules: Free cancellation up to 72 hours before.</li>
                    <li>Safety notes: Equipment will be provided.</li>
                </ul>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Proceed to Book (Hold Slots)'}
                </button>
            </div>
        </form>
    );
};

export default BookingForm;
