import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import BookingForm from './BookingForm';

const TourBookingPage = () => {
    const { id: tourId } = useParams();
    const navigate = useNavigate();
    
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    // Fetch availability
    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/availability/${tourId}`);
            const data = await response.json();
            if (data.success) {
                setAvailabilities(data.data);
            } else {
                setError(data.message || 'Failed to fetch availability');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();

        // Setup Socket.io client
        const socket = io('http://localhost:5000');
        
        socket.on('availabilityUpdated', (data) => {
            if (data.tourId === tourId) {
                console.log('Real-time update received for tour availability:', data);
                // Re-fetch availability to get latest exact slots
                fetchAvailability();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [tourId]);

    const handleCheckAvailability = () => {
        // usually would trigger refetch if there was more filter
        fetchAvailability();
    };
    
    const handleBookingSuccess = (bookingDetails) => {
        setConfirmation(bookingDetails);
        setIsBooking(false);
    };

    if (confirmation) {
        return (
            <div className="max-w-4xl mx-auto p-6 mt-10">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">Thank you for booking with us. We have sent a confirmation email.</p>
                    
                    <div className="bg-gray-50 text-left p-6 rounded-lg mb-6 max-w-md mx-auto inline-block w-full">
                        <p className="mb-2"><strong>Tour ID:</strong> {confirmation.tourId}</p>
                        <p className="mb-2"><strong>Date:</strong> {confirmation.date}</p>
                        <p className="mb-2"><strong>Guests:</strong> {confirmation.numberOfGuests}</p>
                        <p className="mb-2"><strong>Total Paid:</strong> ${confirmation.totalPrice}</p>
                        <p className="mb-2"><strong>Status:</strong> {confirmation.status}</p>
                    </div>
                    
                    <div>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-6">
            <h1 className="text-3xl font-bold mb-6">Booking & Availability</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Available Dates</h2>
                    <button 
                        onClick={handleCheckAvailability}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                        disabled={loading}
                    >
                        {loading ? 'Checking...' : 'Check Availability'}
                    </button>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {loading && !availabilities.length ? (
                    <p>Loading dates...</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {availabilities.length > 0 ? availabilities.map((avail) => (
                            <div 
                                key={avail.id} 
                                className={`p-4 border rounded cursor-pointer transition-colors ${selectedDate === avail.date ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
                                onClick={() => !isBooking && setSelectedDate(avail.date)}
                            >
                                <div className="font-bold text-lg">{avail.date}</div>
                                <div className="text-gray-600">
                                    Remaining Slots: <span className="font-bold">{avail.remainingSlots}</span> / {avail.totalSlots}
                                </div>
                                {avail.remainingSlots === 0 && (
                                    <div className="text-red-500 text-sm font-semibold mt-1">Sold Out</div>
                                )}
                            </div>
                        )) : (
                            <p className="text-gray-500 col-span-2">No upcoming availability found for this tour.</p>
                        )}
                    </div>
                )}
            </div>

            {selectedDate && !isBooking && (
                <div className="flex justify-end">
                    <button 
                        onClick={() => setIsBooking(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md"
                    >
                        Book for {selectedDate}
                    </button>
                </div>
            )}

            {isBooking && selectedDate && (
                <BookingForm 
                    tourId={tourId}
                    selectedDate={selectedDate}
                    onBookingSuccess={handleBookingSuccess}
                    onCancel={() => setIsBooking(false)}
                />
            )}
        </div>
    );
};

export default TourBookingPage;
