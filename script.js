// Sport pricing per hour
const sportPricing = {
    football: 800,
    cricket: 1200,
    basketball: 600,
    tennis: 500
};

// Calculate hours between two times
function calculateHours(startTime, endTime) {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return end > start ? end - start : 0;
}

// Update price display in search form
function updateSearchPrice() {
    const sport = document.getElementById('sport').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const priceDisplay = document.getElementById('priceDisplay');

    if (sport && startTime && endTime) {
        const hours = calculateHours(startTime, endTime);
        const pricePerHour = sportPricing[sport];
        const total = hours * pricePerHour;
        
        if (hours > 0) {
            priceDisplay.innerHTML = `<strong>Total: ₹${total}</strong> (${hours} hour${hours > 1 ? 's' : ''} × ₹${pricePerHour}/hr)`;
        } else {
            priceDisplay.innerHTML = '<strong>Total: ₹0</strong> (Invalid time range)';
        }
    } else {
        priceDisplay.innerHTML = '<strong>Total: ₹0</strong>';
    }
}

// Use geolocation to get user's location
document.getElementById('useLocation')?.addEventListener('click', function() {
    if (navigator.geolocation) {
        this.textContent = '📍 Getting location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // In real app, would reverse geocode coordinates to address
                document.getElementById('location').value = `Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)}`;
                this.textContent = '📍 Use My Location';
                alert('Location detected! Showing nearest turfs.');
                sortTurfsByDistance();
            },
            (error) => {
                alert('Unable to get location. Please enter manually.');
                this.textContent = '📍 Use My Location';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Sort turfs by distance (simulated)
function sortTurfsByDistance() {
    const turfsGrid = document.getElementById('turfsGrid');
    const cards = Array.from(turfsGrid.children);
    
    cards.sort((a, b) => {
        const distA = parseFloat(a.dataset.distance);
        const distB = parseFloat(b.dataset.distance);
        return distA - distB;
    });
    
    cards.forEach(card => turfsGrid.appendChild(card));
}

// Search form submission
document.getElementById('search')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const location = document.getElementById('location').value;
    const sport = document.getElementById('sport').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    // Filter turfs by sport
    const turfsGrid = document.getElementById('turfsGrid');
    const cards = turfsGrid.querySelectorAll('.turf-card');
    
    cards.forEach(card => {
        if (sport && card.dataset.sport !== sport) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
        }
    });
    
    // Scroll to turfs section
    document.querySelector('.popular-turfs').scrollIntoView({ behavior: 'smooth' });
    
    alert(`Searching for ${sport} turfs near ${location} on ${date} from ${startTime} to ${endTime}`);
});

// Event listeners for price calculation
document.getElementById('sport')?.addEventListener('change', updateSearchPrice);
document.getElementById('startTime')?.addEventListener('change', updateSearchPrice);
document.getElementById('endTime')?.addEventListener('change', updateSearchPrice);

// Booking modal variables
let currentBooking = {
    turfName: '',
    sport: '',
    pricePerHour: 0
};

// Open booking modal
function openBookingModal(turfName, sport, pricePerHour) {
    currentBooking = { turfName, sport, pricePerHour };
    
    const modal = document.getElementById('bookingModal');
    const bookingDetails = document.getElementById('bookingDetails');
    
    bookingDetails.innerHTML = `
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h3 style="color: #1e3a8a; margin-bottom: 0.5rem;">${turfName}</h3>
            <p style="color: #6b7280;">Sport: <strong>${sport.charAt(0).toUpperCase() + sport.slice(1)}</strong></p>
            <p style="color: #f97316; font-weight: 600;">₹${pricePerHour}/hour</p>
        </div>
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    document.getElementById('bookingDate').value = today;
    
    modal.style.display = 'block';
    updateBookingPrice();
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// Update booking price
function updateBookingPrice() {
    const startTime = document.getElementById('bookingStartTime').value;
    const endTime = document.getElementById('bookingEndTime').value;
    const bookingTotal = document.getElementById('bookingTotal');
    
    if (startTime && endTime) {
        const hours = calculateHours(startTime, endTime);
        const total = hours * currentBooking.pricePerHour;
        
        if (hours > 0) {
            bookingTotal.textContent = `Total: ₹${total} (${hours} hour${hours > 1 ? 's' : ''})`;
        } else {
            bookingTotal.textContent = 'Total: ₹0 (Invalid time range)';
        }
    }
}

// Booking time change listeners
document.getElementById('bookingStartTime')?.addEventListener('change', function() {
    updateBookingPrice();
    handlePaymentChange();
});
document.getElementById('bookingEndTime')?.addEventListener('change', function() {
    updateBookingPrice();
    handlePaymentChange();
});

// Generate UPI QR Code
function generateUPIQR(amount) {
    // UPI payment URL format
    const upiID = '9409634491@ptyes';
    const name = 'PLAYSLOT';
    const upiURL = `upi://pay?pa=${upiID}&pn=${name}&am=${amount}&cu=INR&tn=Turf Booking`;
    
    // Generate QR code using QR Server API
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiURL)}`;
    
    return qrURL;
}

// Show UPI payment section
function showUPIPayment(total) {
    const qrURL = generateUPIQR(total);
    
    const upiSection = document.getElementById('upiPaymentSection');
    upiSection.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; background: #f0fdf4; border-radius: 8px; margin-top: 1rem;">
            <h4 style="color: #1e3a8a; margin-bottom: 1rem;">Scan QR Code to Pay</h4>
            <img src="${qrURL}" alt="UPI QR Code" style="max-width: 250px; border: 2px solid #10b981; border-radius: 8px;" onerror="this.style.display='none'; document.getElementById('upiIdFallback').style.display='block';">
            <div id="upiIdFallback" style="display: none; padding: 1rem; background: white; border-radius: 6px; margin-top: 1rem;">
                <p style="color: #1e3a8a; font-weight: 600; margin-bottom: 0.5rem;">Pay using UPI ID:</p>
                <p style="color: #059669; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">9409634491@ptyes</p>
                <button onclick="navigator.clipboard.writeText('9409634491@ptyes'); alert('UPI ID copied!')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Copy UPI ID</button>
            </div>
            <p style="margin-top: 1rem; color: #059669; font-weight: 600;">Amount: ₹${total}</p>
            <p style="color: #6b7280; font-size: 0.9rem; margin-top: 0.5rem;">UPI ID: 9409634491@ptyes</p>
            <p style="color: #6b7280; font-size: 0.85rem; margin-top: 0.5rem;">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
        </div>
    `;
    upiSection.style.display = 'block';
}

// Hide UPI payment section
function hideUPIPayment() {
    const upiSection = document.getElementById('upiPaymentSection');
    upiSection.style.display = 'none';
}

// Payment method change handler
function handlePaymentChange() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const startTime = document.getElementById('bookingStartTime').value;
    const endTime = document.getElementById('bookingEndTime').value;
    
    if (paymentMethod === 'upi' && startTime && endTime) {
        const hours = calculateHours(startTime, endTime);
        const total = hours * currentBooking.pricePerHour;
        if (hours > 0) {
            showUPIPayment(total);
        }
    } else {
        hideUPIPayment();
    }
}

// Booking form submission
document.getElementById('bookingForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const date = document.getElementById('bookingDate').value;
    const startTime = document.getElementById('bookingStartTime').value;
    const endTime = document.getElementById('bookingEndTime').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    const hours = calculateHours(startTime, endTime);
    const total = hours * currentBooking.pricePerHour;
    
    if (hours <= 0) {
        alert('Please select a valid time range.');
        return;
    }
    
    const paymentText = paymentMethod === 'cash' ? 'Cash on Play' : 'UPI Payment';
    
    if (paymentMethod === 'upi') {
        alert(`Booking Confirmed!\n\nTurf: ${currentBooking.turfName}\nDate: ${date}\nTime: ${startTime} - ${endTime}\nTotal: ₹${total}\nPayment: ${paymentText}\n\nPlease complete the UPI payment using the QR code above.\nBooking will be confirmed once payment is received.`);
    } else {
        alert(`Booking Confirmed!\n\nTurf: ${currentBooking.turfName}\nDate: ${date}\nTime: ${startTime} - ${endTime}\nTotal: ₹${total}\nPayment: ${paymentText}\n\nPlease pay ₹${total} at the venue before playing.`);
    }
    
    // In real app, would send booking data to backend:
    // POST /api/bookings with { turfName, sport, date, startTime, endTime, total, paymentMethod }
    
    closeBookingModal();
    this.reset();
    hideUPIPayment();
});

// Login Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Sign Up Modal Functions
function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // In real app, would authenticate with backend: POST /api/login
    alert(`Login successful!\nEmail: ${email}`);
    closeLoginModal();
    this.reset();
});

// Sign Up Form Submission
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    
    // In real app, would register with backend: POST /api/register
    alert(`Account created successfully!\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`);
    closeSignupModal();
    this.reset();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === bookingModal) {
        closeBookingModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    } else if (event.target === signupModal) {
        closeSignupModal();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date for search form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
    console.log('PLAYSLOT initialized - Ready to book turfs!');
});