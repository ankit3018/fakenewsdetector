 const firebaseConfig = {
    apiKey: "AIzaSyD_Ly-2T4AnIVhaCTB0dSyI1-gith_J1yk",
    authDomain: "fakenewsdetector-8b8a5.firebaseapp.com",
    projectId: "fakenewsdetector-8b8a5",
    storageBucket: "fakenewsdetector-8b8a5.firebasestorage.app",
    messagingSenderId: "613917087088",
    appId: "1:613917087088:web:5ea73a5f837d184cfd6bb5",
    measurementId: "G-JLV1E36MH3"
  };




// Initialize Firebase once
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch(e) { console.error("Firebase initialization error:", e); }

const db = firebase.firestore();
const auth = firebase.auth();

// --- GLOBAL: AUTHENTICATION STATE OBSERVER ---
auth.onAuthStateChanged(user => {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileNameDisplay = document.getElementById('profile-name-display');

    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'inline-block';
        if (profileNameDisplay) {
            profileNameDisplay.textContent = user.displayName || user.email;
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (signupLink) signupLink.style.display = 'inline-block';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
});

// --- LOGIC FOR THE MAIN MAP PAGE (index.html) ---
if (document.getElementById('map')) {
    const map = L.map('map').setView([12.9716, 77.5946], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const modal = document.getElementById('hazard-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const hazardOptions = document.querySelector('.hazard-options');
    const clearReportsBtn = document.getElementById('clear-reports-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const shareBtn = document.getElementById('share-btn');
    let newHazardLocation = null;
    let markers = {};

    const hazardIcons = {
        Pothole: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
        Accident: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
        'Traffic Jam': L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
        'Road Closure': L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png', iconSize: [25, 41], iconAnchor: [12, 41] })
    };

    function openModal(latlng) {
        newHazardLocation = latlng;
        modal.classList.remove('modal-hidden');
    }

    function closeModal() {
        modal.classList.add('modal-hidden');
    }

    function addHazard(hazardType) {
        if (!newHazardLocation) return;
        db.collection("hazards").add({
            type: hazardType,
            location: new firebase.firestore.GeoPoint(newHazardLocation.lat, newHazardLocation.lng),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => { closeModal(); }).catch((error) => { console.error("Error reporting hazard: ", error); });
    }

    db.collection("hazards").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const hazard = change.doc.data();
            const docId = change.doc.id;
            if (change.type === "added") {
                const icon = hazardIcons[hazard.type] || L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' });
                const popupContent = `<b>${hazard.type}</b> reported. <br><br> <button class="delete-btn" data-id="${docId}">Delete Report</button>`;
                const marker = L.marker([hazard.location.latitude, hazard.location.longitude], { icon: icon }).addTo(map).bindPopup(popupContent);
                markers[docId] = marker;
            }
            if (change.type === "removed") {
                if (markers[docId]) {
                    map.removeLayer(markers[docId]);
                    delete markers[docId];
                }
            }
        });
    });

    function deleteHazard(id) {
        if (confirm("Are you sure you want to delete this report?")) {
            db.collection("hazards").doc(id).delete().catch((error) => { console.error("Error removing hazard: ", error); });
        }
    }

    function clearAllReports() {
        if (confirm("Are you sure you want to delete ALL reports?")) {
            db.collection("hazards").get().then(querySnapshot => {
                const batch = db.batch();
                querySnapshot.forEach(doc => { batch.delete(doc.ref); });
                return batch.commit();
            }).catch(error => console.error("Error clearing hazards: ", error));
        }
    }

    map.on('click', (e) => openModal(e.latlng));
    closeModalBtn.addEventListener('click', closeModal);
    hazardOptions.addEventListener('click', (e) => {
        const target = e.target.closest('.hazard-btn');
        if (target) addHazard(target.getAttribute('data-hazard'));
    });
    clearReportsBtn.addEventListener('click', clearAllReports);
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut(); });
    shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const shareUrl = window.location.href;
        const shareText = "Check out this live road hazard map! #PathIQ";
        if (navigator.share) {
            navigator.share({ title: 'PathIQ - Live Hazard Map', text: shareText, url: shareUrl, });
        } else {
            alert(`Share this link: ${shareUrl}`);
        }
    });

    map.on('popupopen', function() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            if (!btn.hasAttribute('data-listener-attached')) {
                btn.setAttribute('data-listener-attached', 'true');
                btn.addEventListener('click', function() {
                    const docId = this.getAttribute('data-id');
                    deleteHazard(docId);
                });
            }
        });
    });
}

// --- LOGIC FOR AUTHENTICATION & PROFILE PAGES ---
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const profileForm = document.getElementById('profile-form');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                alert('Sign up successful! Please log in.');
                window.location.href = 'login.html';
            })
            .catch((error) => alert(`Sign up error: ${error.message}`));
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert('Login successful! Redirecting to the map...');
                window.location.href = 'index.html';
            })
            .catch((error) => alert(`Login error: ${error.message}`));
    });
}

if (profileForm) {
    const profileEmail = document.getElementById('profile-email');
    const profileName = document.getElementById('profile-name');

    auth.onAuthStateChanged(user => {
        if (user) {
            profileEmail.value = user.email;
            profileName.value = user.displayName || '';
        } else {
            window.location.href = 'login.html';
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            user.updateProfile({ displayName: profileName.value })
            .then(() => {
                alert('Profile updated successfully!');
                location.reload();
            })
            .catch((error) => alert(`Error: ${error.message}`));
        }
    });
}