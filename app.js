// ========== Firebase Configuration ==========
// [IMPORTANT] Replace the config below with your actual Firebase project settings!
const firebaseConfig = {
    apiKey: "AIzaSyCjWM7jyrPkfwbk8Wl4ik2xLvfLGQB7t7A",
    authDomain: "orgasup-dashboard.firebaseapp.com",
    databaseURL: "https://orgasup-dashboard-default-rtdb.firebaseio.com",
    projectId: "orgasup-dashboard",
    storageBucket: "orgasup-dashboard.firebasestorage.app",
    messagingSenderId: "763236155962",
    appId: "1:763236155962:web:d266c166cb108340c5eb03",
    measurementId: "G-2RXH0XQPZP"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
}
const db = (typeof firebase !== 'undefined' && firebase.apps.length) ? firebase.database() : null;

// Connection Status Monitor
if (db) {
    db.ref('.info/connected').on('value', (snap) => {
        const dot = document.getElementById('syncDot');
        const text = document.getElementById('syncText');
        if (dot && text) {
            if (snap.val() === true) {
                dot.style.background = '#10b981'; // Green
                text.textContent = '클라우드 연결됨';
            } else {
                dot.style.background = '#ef4444'; // Red
                text.textContent = '오프라인 (로컬저장)';
            }
        }
    });
}

// Real-time synchronization for all data
let isSyncInitialized = false;
function initRealtimeSync() {
    if (!db || isSyncInitialized) return;
    isSyncInitialized = true;

    db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const arr = Array.isArray(data) ? data : Object.values(data);
            localStorage.setItem('ogasup_users', JSON.stringify(arr));
            if (currentTab === 'settings') renderSettings();
        }
    });

    db.ref('sales').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const arr = Array.isArray(data) ? data : Object.values(data);
            localStorage.setItem('ogasup_sales', JSON.stringify(arr));
            if (currentTab === 'dashboard') renderDashboard();
            if (currentTab === 'entry' && currentEntryTab === 'sales') renderSpreadsheet('sales');
        }
    });

    const schemas = ['online', 'ipumgo', 'neoart', 'ogasup'];
    schemas.forEach(s => {
        db.ref('details/' + s).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const arr = Array.isArray(data) ? data : Object.values(data);
                localStorage.setItem('ogasup_details_' + s, JSON.stringify(arr));
                if (currentTab === 'dashboard') renderDashboard();
                if (currentTab === 'entry' && currentEntryTab === s) renderSpreadsheet(s);
            }
        });
    });
}

// ========== 1. Data Initialization & Storage ==========
let currentGlobalMonth = '2026-03'; // Default to specific month for spreadsheet
let currentTab = 'dashboard';
let currentEntryTab = 'sales';

function initData(force = false) {
    // Users
    if (!localStorage.getItem('ogasup_users')) {
        const defaultUsers = [{
            id: 'admin', password: '1234', name: '최고관리자', dept: '관리부', position: '대표', phone: '010-0000-0000', role: 'admin', status: 'approved'
        }];
        localStorage.setItem('ogasup_users', JSON.stringify(defaultUsers));
    }

    // Legacy version wipe logic removed to prevent overwriting cloud sync on new domains.
    if (force) {
        localStorage.removeItem('ogasup_sales');
        localStorage.removeItem('ogasup_users');
        localStorage.removeItem('ogasup_details_online');
        localStorage.removeItem('ogasup_details_ipumgo');
        localStorage.removeItem('ogasup_details_neoart');
        localStorage.removeItem('ogasup_details_ogasup');
        localStorage.removeItem('ogasup_inventory');
    }

    // Sales Data (Aggregated overall sheet)
    // ONLY initialize default data if LOCAL STORAGE is empty.
    if (!localStorage.getItem('ogasup_sales') || JSON.parse(localStorage.getItem('ogasup_sales')).length === 0) {
        const initialData = [
            // Jan
            { date: "2026-01-01", smartstore: 34810, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-02", smartstore: 0, coupang: 300462, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-05", smartstore: 0, coupang: 0, mall: 0, ipumgo: 310000, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-06", smartstore: 0, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 380000, fair: 0 },
            { date: "2026-01-07", smartstore: 0, coupang: 0, mall: 0, ipumgo: 62000, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-08", smartstore: 0, coupang: 0, mall: 0, ipumgo: 31000, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-09", smartstore: 72360, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-12", smartstore: 21080, coupang: 0, mall: 0, ipumgo: 155000, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-13", smartstore: 0, coupang: 88923, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-16", smartstore: 24900, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-17", smartstore: 65360, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-18", smartstore: 34810, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-21", smartstore: 0, coupang: 0, mall: 0, ipumgo: 310000, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-22", smartstore: 0, coupang: 0, mall: 0, ipumgo: 310000, neoart: 261360, care: 0, fair: 0 },
            { date: "2026-01-25", smartstore: 11270, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-29", smartstore: 24900, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-01-30", smartstore: 34810, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 380000, fair: 0 },

            // Feb
            { date: "2026-02-01", smartstore: 23160, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-03", smartstore: 35380, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-04", smartstore: 88520, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-08", smartstore: 43900, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-09", smartstore: 23940, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-10", smartstore: 65360, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-11", smartstore: 26400, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-12", smartstore: 23160, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-19", smartstore: 91520, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-22", smartstore: 35370, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-23", smartstore: 30310, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-25", smartstore: 34810, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-02-26", smartstore: 27900, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },

            // March
            { date: "2026-03-01", smartstore: 0, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 }, // Added missing March 1
            { date: "2026-03-02", smartstore: 12270, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-03", smartstore: 65360, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-04", smartstore: 0, coupang: 11000, mall: 748800, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-05", smartstore: 115000, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-06", smartstore: 49000, coupang: 0, mall: 400000, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-07", smartstore: 0, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 }, // Added missing March 7
            { date: "2026-03-08", smartstore: 101000, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-09", smartstore: 461000, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-10", smartstore: 46500, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-11", smartstore: 26000, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 },
            { date: "2026-03-12", smartstore: 0, coupang: 0, mall: 0, ipumgo: 310000 + 99200, neoart: 0, care: 0, fair: 0 }, // Aggregated ipumgo sales for March 12
            { date: "2026-03-13", smartstore: 0, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 }, // Added missing March 13
            { date: "2026-03-14", smartstore: 0, coupang: 0, mall: 0, ipumgo: 0, neoart: 0, care: 0, fair: 0 }, // Added missing March 14
            // March (Offline additions from details)
        ];
        localStorage.setItem('ogasup_sales', JSON.stringify(initialData));
    }

    // Initial Details Data
    if (!localStorage.getItem('ogasup_details_online')) {
        const onlineData = [
            { id: 401, date: "2026-01-01", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 34810, paid: 34810, tax: "" },
            { id: 402, date: "2026-01-02", branch: "쿠팡", type: "판매", product: "단품", qty: 1, price: 300462, paid: 300462, tax: "" },
            { id: 403, date: "2026-01-09", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 72360, paid: 72360, tax: "" },
            { id: 404, date: "2026-01-12", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 21080, paid: 21080, tax: "" },
            { id: 405, date: "2026-01-13", branch: "쿠팡", type: "판매", product: "단품", qty: 1, price: 88923, paid: 88923, tax: "" },
            { id: 406, date: "2026-01-16", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 24900, paid: 24900, tax: "" },
            { id: 407, date: "2026-01-17", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 65360, paid: 65360, tax: "" },
            { id: 408, date: "2026-01-18", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 34810, paid: 34810, tax: "" },
            { id: 409, date: "2026-01-25", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 11270, paid: 11270, tax: "" },
            { id: 410, date: "2026-01-29", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 24900, paid: 24900, tax: "" },
            { id: 411, date: "2026-01-30", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 34810, paid: 34810, tax: "" },
            { id: 412, date: "2026-02-01", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 23160, paid: 23160, tax: "" },
            { id: 413, date: "2026-02-03", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 35380, paid: 35380, tax: "" },
            { id: 414, date: "2026-02-04", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 88520, paid: 88520, tax: "" },
            { id: 415, date: "2026-02-08", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 43900, paid: 43900, tax: "" },
            { id: 416, date: "2026-02-09", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 23940, paid: 23940, tax: "" },
            { id: 417, date: "2026-02-10", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 65360, paid: 65360, tax: "" },
            { id: 418, date: "2026-02-11", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 26400, paid: 26400, tax: "" },
            { id: 419, date: "2026-02-12", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 23160, paid: 23160, tax: "" },
            { id: 420, date: "2026-02-19", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 91520, paid: 91520, tax: "" },
            { id: 421, date: "2026-02-22", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 35370, paid: 35370, tax: "" },
            { id: 422, date: "2026-02-23", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 30310, paid: 30310, tax: "" },
            { id: 423, date: "2026-02-25", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 34810, paid: 34810, tax: "" },
            { id: 424, date: "2026-02-26", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 27900, paid: 27900, tax: "" },
            { id: 425, date: "2026-03-02", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 12270, paid: 12270, tax: "" },
            { id: 426, date: "2026-03-03", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 65360, paid: 65360, tax: "" },
            { id: 427, date: "2026-03-04", branch: "쿠팡", type: "판매", product: "단품", qty: 1, price: 11000, paid: 11000, tax: "" },
            { id: 428, date: "2026-03-04", branch: "자사몰", type: "판매", product: "단품", qty: 1, price: 748800, paid: 748800, tax: "" },
            { id: 429, date: "2026-03-05", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 115000, paid: 115000, tax: "" },
            { id: 430, date: "2026-03-06", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 49000, paid: 49000, tax: "" },
            { id: 431, date: "2026-03-06", branch: "자사몰", type: "판매", product: "단품", qty: 1, price: 400000, paid: 400000, tax: "" },
            { id: 432, date: "2026-03-08", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 101000, paid: 101000, tax: "" },
            { id: 433, date: "2026-03-09", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 461000, paid: 461000, tax: "" },
            { id: 434, date: "2026-03-10", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 46500, paid: 46500, tax: "" },
            { id: 435, date: "2026-03-11", branch: "스마트스토어", type: "판매", product: "단품", qty: 1, price: 26000, paid: 26000, tax: "" },
        ];
        localStorage.setItem('ogasup_details_online', JSON.stringify(onlineData));
    }

    if (!localStorage.getItem('ogasup_details_ipumgo')) {
        const ipumgoData = [
            { id: 101, date: "2026-01-06", branch: "프라우디 산후조리원", type: "판매", product: "중형", qty: 100, price: 310000, paid: 310000, tax: "발행완료" },
            { id: 102, date: "2026-01-06", branch: "프라우디 산후조리원", type: "지원", product: "중형", qty: 100, price: 310000, paid: 0, tax: "" },
            { id: 103, date: "2026-01-07", branch: "에그리나 강동점", type: "지원", product: "중형", qty: 20, price: 62000, paid: 0, tax: "" },
            { id: 104, date: "2026-01-07", branch: "에그리나 강동점", type: "판매", product: "중형", qty: 20, price: 62000, paid: 62000, tax: "발행완료" },
            { id: 105, date: "2026-01-08", branch: "아이소리 산후조리원", type: "판매", product: "중형", qty: 10, price: 31000, paid: 31000, tax: "발행완료" },
            { id: 106, date: "2026-01-08", branch: "아이소리 산후조리원", type: "지원", product: "중형", qty: 10, price: 31000, paid: 0, tax: "" },
            { id: 107, date: "2026-01-12", branch: "벨르마망 산후조리원", type: "지원", product: "중형", qty: 50, price: 155000, paid: 0, tax: "" },
            { id: 108, date: "2026-01-12", branch: "벨르마망 산후조리원", type: "판매", product: "중형", qty: 50, price: 155000, paid: 155000, tax: "발행완료" },
            { id: 109, date: "2026-01-21", branch: "아르테미스산후조리원", type: "지원", product: "중형", qty: 100, price: 310000, paid: 0, tax: "" },
            { id: 110, date: "2026-01-21", branch: "아르테미스산후조리원", type: "판매", product: "중형", qty: 100, price: 310000, paid: 310000, tax: "발행완료" },
            { id: 111, date: "2026-01-23", branch: "퀸스 산후조리원", type: "판매", product: "입오버", qty: 100, price: 390000, paid: 390000, tax: "발행완료" },
            { id: 112, date: "2026-02-20", branch: "에그리나 강동점", type: "판매", product: "중형", qty: 10, price: 31000, paid: 31000, tax: "" },
            { id: 113, date: "2026-02-20", branch: "에그리나 강동점", type: "판매", product: "입오버", qty: 10, price: 40000, paid: 40000, tax: "" },
            { id: 114, date: "2026-02-27", branch: "퀸스 산후조리원", type: "판매", product: "입오버", qty: 100, price: 400000, paid: 400000, tax: "" },
            { id: 115, date: "2026-02-27", branch: "더리아산후조리원", type: "판매", product: "입오버", qty: 48, price: 192000, paid: 192000, tax: "" },
            { id: 116, date: "2026-03-03", branch: "아이품고사무실", type: "지원", product: "입오버", qty: 96, price: 384000, paid: 0, tax: "" },
            { id: 117, date: "2026-03-03", branch: "아이품고사무실", type: "지원", product: "입오버 2P", qty: 144, price: 0, paid: 0, tax: "" },
            { id: 118, date: "2026-03-04", branch: "퀸스 산후조리원", type: "지원", product: "입오버 2P", qty: 72, price: 0, paid: 0, tax: "" },
            { id: 119, date: "2026-03-12", branch: "쉬즈메디조리원", type: "판매", product: "중형", qty: 100, price: 310000, paid: 310000, tax: "" },
            { id: 120, date: "2026-03-12", branch: "에그리나 강동점", type: "판매", product: "중형", qty: 32, price: 99200, paid: 99200, tax: "" },
        ];
        localStorage.setItem('ogasup_details_ipumgo', JSON.stringify(ipumgoData));
    }

    if (!localStorage.getItem('ogasup_details_neoart')) {
        const neoartData = [
            { id: 201, date: "2026-01-22", branch: "한빛여성병원", type: "지원", product: "중형", qty: 30, price: 114000, paid: 0, tax: "" },
            { id: 202, date: "2026-01-22", branch: "한빛여성병원", type: "판매", product: "중형", qty: 30, price: 114000, paid: 114000, tax: "발행완료" },
            { id: 203, date: "2026-01-22", branch: "한빛여성병원", type: "지원", product: "청결제", qty: 48, price: 147360, paid: 0, tax: "" },
            { id: 204, date: "2026-01-22", branch: "한빛여성병원", type: "판매", product: "청결제", qty: 48, price: 147360, paid: 147360, tax: "발행완료" },
            { id: 205, date: "2026-02-27", branch: "부산사무실", type: "지원", product: "입오버", qty: 100, price: 400000, paid: 0, tax: "" },
            { id: 206, date: "2026-03-03", branch: "부산사무실", type: "지원", product: "입오버", qty: 144, price: 0, paid: 0, tax: "" },
            { id: 207, date: "2026-03-03", branch: "인천사무실", type: "지원", product: "입오버", qty: 96, price: 384000, paid: 0, tax: "" },
            { id: 208, date: "2026-03-03", branch: "인천사무실", type: "지원", product: "입오버 2P", qty: 108, price: 0, paid: 0, tax: "" },
            { id: 209, date: "2026-03-03", branch: "부산사무실", type: "지원", product: "입오버", qty: 96, price: 384000, paid: 0, tax: "" },
            { id: 210, date: "2026-03-03", branch: "부산사무실", type: "지원", product: "중형", qty: 96, price: 364800, paid: 0, tax: "" },
            { id: 211, date: "2026-03-03", branch: "부산사무실", type: "지원", product: "입오버 2P", qty: 144, price: 0, paid: 0, tax: "" },
            { id: 212, date: "2026-03-12", branch: "인천사무실", type: "지원", product: "중형", qty: 100, price: 370000, paid: 0, tax: "" },
            { id: 213, date: "2026-03-12", branch: "부산사무실", type: "지원", product: "중형", qty: 100, price: 370000, paid: 0, tax: "" },
        ];
        localStorage.setItem('ogasup_details_neoart', JSON.stringify(neoartData));
    }

    if (!localStorage.getItem('ogasup_details_ogasup')) {
        const ogasupData = [
            { id: 301, date: "2026-01-06", branch: "결한방산후조리원", type: "판매", product: "중형", qty: 100, price: 380000, paid: 380000, tax: "발행완료" },
            { id: 302, date: "2026-01-06", branch: "결한방산후조리원", type: "지원", product: "중형", qty: 20, price: 76000, paid: 0, tax: "" },
            { id: 303, date: "2026-01-13", branch: "위드맘스쿨(예비...)", type: "지원", product: "중형", qty: 90, price: 342000, paid: 0, tax: "" },
            { id: 304, date: "2026-01-13", branch: "롯데 파스퇴르", type: "지원", product: "중형", qty: 50, price: 190000, paid: 0, tax: "" },
            { id: 305, date: "2026-01-13", branch: "롯데 배정현", type: "지원", product: "중형", qty: 60, price: 228000, paid: 0, tax: "" },
            { id: 306, date: "2026-01-19", branch: "위드맘스쿨(예비...)", type: "지원", product: "중형", qty: 20, price: 76000, paid: 0, tax: "" },
            { id: 307, date: "2026-01-19", branch: "위드맘스쿨(예비...)", type: "지원", product: "청결제", qty: 5, price: 55000, paid: 0, tax: "" },
            { id: 308, date: "2026-01-30", branch: "베르사유 산후조리원", type: "판매", product: "중형", qty: 100, price: 380000, paid: 380000, tax: "발행완료" },
            { id: 310, date: "2026-02-10", branch: "위드맘스쿨(예비맘교실)", type: "지원", product: "중형", qty: 115, price: 437000, paid: 0, tax: "" },
            { id: 311, date: "2026-02-12", branch: "롯데 배정현", type: "지원", product: "중형", qty: 162, price: 615600, paid: 0, tax: "" },
            { id: 312, date: "2026-02-19", branch: "롯데 파스퇴르", type: "지원", product: "중형", qty: 162, price: 615600, paid: 0, tax: "" },
            { id: 313, date: "2026-02-23", branch: "결한방산후조리원", type: "판매", product: "중형", qty: 120, price: 456000, paid: 456000, tax: "발행완료" },
            { id: 314, date: "2026-02-23", branch: "결한방산후조리원", type: "지원", product: "중형", qty: 8, price: 30400, paid: 0, tax: "" },
            { id: 315, date: "2026-03-03", branch: "롯데 배정현", type: "지원", product: "입오버 2P", qty: 144, price: 0, paid: 0, tax: "" },
            { id: 316, date: "2026-03-03", branch: "아기를부탁해", type: "지원", product: "입오버", qty: 24, price: 96000, paid: 0, tax: "" },
            { id: 317, date: "2026-03-03", branch: "아기를부탁해", type: "지원", product: "입오버 2P", qty: 72, price: 0, paid: 0, tax: "" },
            { id: 318, date: "2026-03-04", branch: "쉼산후조리원", type: "판매", product: "입오버", qty: 96, price: 460800, paid: 460800, tax: "발행완료" },
            { id: 319, date: "2026-03-04", branch: "쉼산후조리원", type: "판매", product: "중형", qty: 96, price: 460800, paid: 460800, tax: "발행완료" },
            { id: 320, date: "2026-03-04", branch: "쉼산후조리원", type: "지원", product: "입오버 2P", qty: 36, price: 0, paid: 0, tax: "" },
            { id: 321, date: "2026-03-05", branch: "쉼 산후조리원", type: "지원", product: "입오버 2P", qty: 72, price: 0, paid: 0, tax: "" },
            { id: 322, date: "2026-03-06", branch: "베르사유", type: "판매", product: "입오버", qty: 100, price: 400000, paid: 400000, tax: "발행완료" },
            { id: 323, date: "2026-03-06", branch: "베르사유", type: "지원", product: "입오버 2P", qty: 36, price: 0, paid: 0, tax: "" },
            { id: 324, date: "2026-03-10", branch: "고은빛산부인과", type: "지원", product: "입오버 2P", qty: 160, price: 0, paid: 0, tax: "" },
            { id: 325, date: "2026-03-10", branch: "라벨메르산후조리원", type: "지원", product: "입오버 2P", qty: 160, price: 0, paid: 0, tax: "" },
            { id: 326, date: "2026-03-12", branch: "위드맘스쿨(예비맘교실)", type: "지원", product: "입오버 2P", qty: 144, price: 0, paid: 0, tax: "" },
        ];
        localStorage.setItem('ogasup_details_ogasup', JSON.stringify(ogasupData));
    }

    // Inventory Data
    if (!localStorage.getItem('ogasup_inventory')) {
        const defaultInv = { 'panties_4p': 10873, 'panties_2p': 7160, 'medium': 3372, 'cleanser': 240 };
        localStorage.setItem('ogasup_inventory', JSON.stringify(defaultInv));
    }
}

// initData();  <-- Move to window.onload

// Utility Get/Set Data
function getSalesData() { return JSON.parse(localStorage.getItem('ogasup_sales')) || []; }
function getDetails(schema) { return JSON.parse(localStorage.getItem('ogasup_details_' + schema)) || []; }

async function saveSales(data) {
    if (db) {
        // 서버에 먼저 저장하고, 리스너가 로컬 데이터를 갱신하게 함
        await db.ref('sales').set(data);
    } else {
        localStorage.setItem('ogasup_sales', JSON.stringify(data));
    }
}

async function saveDetails(schema, data) {
    if (db) {
        await db.ref('details/' + schema).set(data);
    } else {
        localStorage.setItem('ogasup_details_' + schema, JSON.stringify(data));
    }
}

function getUsers() {
    try {
        const data = localStorage.getItem('ogasup_users');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

async function saveUsers(data) {
    if (db) {
        await db.ref('users').set(data);
    } else {
        localStorage.setItem('ogasup_users', JSON.stringify(data));
    }
}

function getInventory() { return JSON.parse(localStorage.getItem('ogasup_inventory')) || {}; }

async function saveInventory(data) { // Renamed from saveInventoryToCloud
    if (db) {
        await db.ref('inventory').set(data);
    } else {
        localStorage.setItem('ogasup_inventory', JSON.stringify(data));
    }
}

async function syncAllFromCloud() {
    if (!db) return false;
    return new Promise((resolve, reject) => {
        // .once는 가끔 네트워크 상태에 따라 영영 응답이 없는 경우가 있으므로 Timeout 설정
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.warn("Cloud sync timed out, using local storage fallback.");
                resolve(false);
            }
        }, 5000);

        db.ref('/').once('value').then(snapshot => {
            resolved = true;
            clearTimeout(timeout);
            const cloudData = snapshot.val();

            if (!cloudData || (!cloudData.sales && !cloudData.users)) {
                resolve(false);
                return;
            }

            const toArray = (obj) => {
                if (!obj) return [];
                if (Array.isArray(obj)) return obj;
                return Object.values(obj);
            };

            if (cloudData.sales) localStorage.setItem('ogasup_sales', JSON.stringify(toArray(cloudData.sales)));
            if (cloudData.users) localStorage.setItem('ogasup_users', JSON.stringify(toArray(cloudData.users)));
            if (cloudData.inventory) localStorage.setItem('ogasup_inventory', JSON.stringify(cloudData.inventory));
            if (cloudData.details) {
                for (let schema in cloudData.details) {
                    localStorage.setItem('ogasup_details_' + schema, JSON.stringify(toArray(cloudData.details[schema])));
                }
            }
            localStorage.setItem('ogasup_cloud_synced', 'true');
            resolve(true);
        }).catch(err => {
            resolved = true;
            clearTimeout(timeout);
            console.error("Cloud sync error:", err);
            resolve(false);
        });
    });
}

async function migrateLocalDataToCloud() {
    if (!db) return;
    try {
        const snap = await db.ref('/').once('value');
        const cloudData = snap.val();

        // 데이터가 아예 없는 경우에만 로컬 데이터를 서버에 통째로 백업 (웨일 데이터 서버 전송용)
        if (!cloudData || (!cloudData.sales && !cloudData.users)) {
            console.log("Cloud is empty. Migrating local data to cloud...");
            const dataToPush = {
                sales: getSalesData(),
                users: getUsers(),
                inventory: getInventory(),
                details: {
                    online: getDetails('online'),
                    ipumgo: getDetails('ipumgo'),
                    neoart: getDetails('neoart'),
                    ogasup: getDetails('ogasup')
                }
            };
            await db.ref('/').set(dataToPush);
            console.log("Migration successful!");
        }
    } catch (e) { console.error("Migration error:", e); }
}

function getFilteredData(dataArray) {
    if (!dataArray) return [];
    let raw = Array.isArray(dataArray) ? dataArray : Object.values(dataArray);
    if (currentGlobalMonth !== 'all') {
        // '2026-03' 과 '2026-3' 모두 대응 가능하도록 -03 이나 -3 둘 다 체크
        const [year, month] = currentGlobalMonth.split('-');
        const shortMonth = Number(month).toString();
        const fullPrefix = `${year}-${month.padStart(2, '0')}`;
        const shortPrefix = `${year}-${shortMonth}`;

        raw = raw.filter(d => {
            if (!d.date) return false;
            return d.date.startsWith(fullPrefix) || d.date.startsWith(shortPrefix);
        });
    }
    return raw.sort((a, b) => new Date(a.date) - new Date(b.date));
}

const formatCurrency = (amount) => amount ? amount.toLocaleString('ko-KR') + "원" : "0원";
function unformat(val) { return String(val).replace(/,/g, ''); }
function formatNumberInput(el) {
    let val = unformat(el.value);
    if (!isNaN(val) && val !== '') {
        el.value = Number(val).toLocaleString();
    }
}
function generateId() { return Date.now() + Math.floor(Math.random() * 1000); }


// ========== 2. Auth ==========
function toggleAuth(type) {
    if (type === 'signup') {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
    } else {
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value;
    const pw = document.getElementById('loginPw').value;

    console.log("Login attempt:", id);

    // 1. 우선 로컬에 있는 정보로 즉시 시도 (오프라인/지연 대응)
    let users = getUsers();
    let user = users.find(u => u.id === id && u.password === pw);

    // 2. 관리자 비상 로그인 (서버 연결 실패시 대비)
    if (!user && id === 'admin' && pw === '1234') {
        user = { id: 'admin', password: '1234', name: '최고관리자', role: 'superadmin', status: 'approved' };
    }

    // 3. 만약 로컬에 없으면 서버에서 강제로 다시 긁어옴 (동기화 실패 대비)
    if (!user && db) {
        try {
            const snapshot = await db.ref('users').once('value');
            if (snapshot && snapshot.val()) {
                const arr = Array.isArray(snapshot.val()) ? snapshot.val() : Object.values(snapshot.val());
                localStorage.setItem('ogasup_users', JSON.stringify(arr));
                users = arr;
                user = users.find(u => u.id === id && u.password === pw);
            }
        } catch (err) { console.error("Login server sync error:", err); }
    }

    if (user) {
        if (user.status !== 'approved') {
            alert("입력하신 계정은 아직 승인 전입니다. 최고관리자에게 승인을 요청해 주세요.");
            return;
        }
        localStorage.setItem('activeUser', JSON.stringify(user));

        // 로그인 성공 후 배경에서 데이터 동기화 시도 (UI는 즉시 진입)
        enterDashboard();
        syncAllFromCloud();
    } else {
        alert("아이디 또는 비밀번호가 일치하지 않습니다. (관리자 승인 여부도 확인해주세요)");
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const pw = document.getElementById('regPw').value;

    // Sync users again to avoid duplicate names across devices with timeout
    if (db) {
        try {
            const syncPromise = db.ref('users').once('value');
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
            const snapshot = await Promise.race([syncPromise, timeoutPromise]);
            if (snapshot && snapshot.val()) {
                localStorage.setItem('ogasup_users', JSON.stringify(snapshot.val()));
            }
        } catch (e) {
            console.warn("Cloud signup sync failed", e);
        }
    }

    const users = getUsers();
    if (users.some(u => u.id === name)) return alert("이미 같은 이름으로 요청된 가입 정보가 존재합니다.");

    const newUser = {
        id: name, password: pw, name: name, dept: document.getElementById('regDept').value,
        position: document.getElementById('regPosition').value, phone: document.getElementById('regPhone').value,
        role: 'user', status: 'pending'
    };

    users.push(newUser);
    await saveUsers(users);
    alert("가입 요청 완료. 관리자 승인 후 로그인해 주세요.");
    toggleAuth('login');
    e.target.reset();
}

function handleLogout() {
    localStorage.removeItem('activeUser');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('authContainer').classList.remove('hidden');
}


// ========== 3. Navigation ==========
function enterDashboard() {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    document.getElementById('sidebarAvatar').textContent = user.name.charAt(0);
    document.getElementById('sidebarName').textContent = user.name;

    // Role display mapping
    let roleText = '회원';
    if (user.role === 'superadmin' || user.id === 'admin') roleText = '최고관리자';
    else if (user.role === 'admin') roleText = '부관리자';

    document.getElementById('sidebarRole').textContent = roleText;

    // Only Super Admin can see the settings menu
    const isSuper = (user.role === 'superadmin' || user.id === 'admin');
    document.getElementById('menuSettings').style.display = isSuper ? 'flex' : 'none';

    switchMenu('dashboard');
    lucide.createIcons();
}

function switchMenu(section) {
    currentTab = section;
    const user = JSON.parse(localStorage.getItem('activeUser'));
    document.querySelectorAll('.section-view').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById('sec-' + section);
    if (target) {
        target.classList.remove('hidden');

        // Read-only logic for 'user' role members
        const headerActions = target.querySelector('.header-actions');
        if (headerActions) {
            if (user.role === 'user' && user.id !== 'admin') {
                headerActions.style.display = 'none'; // Hide add/save buttons
            } else {
                headerActions.style.display = 'flex';
            }
        }
    }

    if (section === 'dashboard') renderDashboard();
    else if (section === 'inventory') renderInventory();
    else if (section === 'settings') renderSettings();
    else renderSpreadsheet(section);

    // Sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(section)) item.classList.add('active');
    });
}

function handleMonthChange(val) {
    currentGlobalMonth = val;
    // renderCurrentTab(); // This function is now refactored into switchMenu
    switchMenu(currentTab); // Re-render current tab with new month filter
}

// function renderCurrentTab() { // This function is now refactored into switchMenu
//     if (currentTab === 'dashboard') renderDashboard();
//     if (currentTab === 'online') renderSpreadsheet('online');
//     if (currentTab === 'ipumgo') renderSpreadsheet('ipumgo');
//     if (currentTab === 'neoart') renderSpreadsheet('neoart');
//     if (currentTab === 'ogasup') renderSpreadsheet('ogasup');
//     if (currentTab === 'inventory') renderInventory();
//     if (currentTab === 'settings') renderSettings();
// }


// ========== 4. Rendering logic ==========
let globalChart, chartOnline, chartOffline;

function renderDashboard() {
    // Collect filtered data for current month KPIs
    const fOnline = getFilteredData(getDetails('online'));
    const fOffline = [...getFilteredData(getDetails('ipumgo')), ...getFilteredData(getDetails('neoart')), ...getFilteredData(getDetails('ogasup'))];
    allOnline.forEach(d => {
        if (d.type !== '판매') return;
        const month = d.date.substring(0, 7);
        monthlyOnline[month] = (monthlyOnline[month] || 0) + (d.price || 0);
        trendLabelsSet.add(month);
    });

    allOffline.forEach(d => {
        if (d.type !== '판매') return;
        const month = d.date.substring(0, 7);
        monthlyOffline[month] = (monthlyOffline[month] || 0) + (d.price || 0);
        trendLabelsSet.add(month);
    });

    const subTitle = document.getElementById('dashboard-date-sub');
    if (currentGlobalMonth === 'all') subTitle.textContent = "전체 기간(1~3월) 차트 및 요약 현황입니다.";
    else subTitle.textContent = `${currentGlobalMonth.split('-')[0]}년 ${parseInt(currentGlobalMonth.split('-')[1])}월 차트 및 요약 현황입니다.`;

    const commonScale = { x: { grid: { display: false } }, y: { beginAtZero: true } };

    // 1. Online vs Offline Doughnut Chart
    if (chartOnline) chartOnline.destroy();
    chartOnline = new Chart(document.getElementById('chartOnline').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['온라인 통합 매출', '오프라인 통합 매출'],
            datasets: [{
                data: [tOnline, tOffline],
                backgroundColor: ['#f97316', '#1e3a8a'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Monthly Trend Line Chart (Total Revenue)
    const trendLabels = Array.from(trendLabelsSet).sort();
    const trendDataOnline = trendLabels.map(m => monthlyOnline[m] || 0);
    const trendDataOffline = trendLabels.map(m => monthlyOffline[m] || 0);

    if (chartOffline) chartOffline.destroy(); // Reuse var for simplicity or create new if we added to index.html 
    // We'll map the second canvas 'chartOffline' to the monthly trend for now, but wait, let's look at index.html replacing.
    if (globalChart) globalChart.destroy();
    if (document.getElementById('mainSalesChart')) {
        globalChart = new Chart(document.getElementById('mainSalesChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [
                    {
                        label: '온라인 매출',
                        data: trendDataOnline,
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: '오프라인 매출',
                        data: trendDataOffline,
                        borderColor: '#1e3a8a',
                        backgroundColor: 'rgba(30, 58, 138, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: commonScale }
        });
    }

    const inv = getInventory();
    document.getElementById('dashboard-inv-list').innerHTML = `
        <div class="inventory-item"><div><div class="inv-name">입오버 4P</div></div><div class="inv-total" style="color:var(--primary-dark)">${inv.panties_4p.toLocaleString()}개</div></div>
        <div class="inventory-item"><div><div class="inv-name">입오버 2P</div></div><div class="inv-total" style="color:var(--primary-dark)">${inv.panties_2p.toLocaleString()}개</div></div>
        <div class="inventory-item"><div><div class="inv-name">중형</div></div><div class="inv-total" style="color:var(--primary-dark)">${inv.medium.toLocaleString()}개</div></div>
        <div class="inventory-item"><div><div class="inv-name">청결제</div></div><div class="inv-total" style="color:var(--primary-dark)">${inv.cleanser.toLocaleString()}개</div></div>
    `;
}

function renderSpreadsheet(schema) {
    const tbody = document.getElementById(`sheet-${schema}-tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    const data = getFilteredData(getDetails(schema));

    data.forEach(d => {
        appendDetailRow(schema, tbody, d);
    });

    renderMiniDashboard(schema);

    if (data.length === 0) {
        let targetMonth = currentGlobalMonth === 'all' ? '2026-03' : currentGlobalMonth;
        appendDetailRow(schema, tbody, { id: generateId(), date: targetMonth + '-01' });
    }
}

function appendDetailRow(schema, tbody, data) {
    const tr = document.createElement('tr');
    tr.dataset.id = data.id || generateId();

    const types = ['판매', '지원', '기타'];
    const typeOptions = types.map(t => `<option value="${t}" ${data.type === t ? 'selected' : ''}>${t}</option>`).join('');

    const products = ['입오버', '입오버 2P', '중형', '청결제'];
    const productOptions = products.map(p => `<option value="${p}" ${data.product === p ? 'selected' : ''}>${p}</option>`).join('');

    const onlineChannels = ['스마트스토어', '쿠팡', '자사몰', '기타'];
    const channelOptions = onlineChannels.map(c => `<option value="${c}" ${data.branch === c ? 'selected' : ''}>${c}</option>`).join('');

    const taxStatuses = ['미발행', '발행완료'];
    const taxOptions = taxStatuses.map(tx => `<option value="${tx}" ${data.tax === tx ? 'selected' : ''}>${tx}</option>`).join('');

    tr.innerHTML = `
        <td><button class="row-btn" onclick="removeDetailRow(this)"><i data-lucide="trash-2" style="width:16px;"></i></button></td>
        <td><input type="date" class="sheet-input text-left" data-col="date" value="${data.date || ''}"></td>
        <td>
            ${schema === 'online'
            ? `<select class="sheet-select" data-col="branch"><option value="">선택</option>${channelOptions}</select>`
            : `<input type="text" class="sheet-input text-left" data-col="branch" value="${data.branch || ''}" placeholder="지점명">`
        }
        </td>
        <td class="type-cell">
            <select class="sheet-select" data-col="type" onchange="updateTypeColor(this)">
                <option value="">선택</option>${typeOptions}
            </select>
        </td>
        <td><select class="sheet-select" data-col="product"><option value="">선택</option>${productOptions}</select></td>
        <td><input type="text" class="sheet-input" data-col="qty" value="${(data.qty || '').toLocaleString()}" onblur="formatNumberInput(this)"></td>
        <td><input type="text" class="sheet-input" data-col="price" value="${(data.price || '').toLocaleString()}" onblur="formatNumberInput(this)"></td>
        <td><input type="text" class="sheet-input" data-col="paid" value="${(data.paid || '').toLocaleString()}" onblur="formatNumberInput(this)"></td>
        <td>
            ${schema === 'online'
            ? `<input type="text" class="sheet-input text-left" data-col="tax" value="${data.tax || ''}" placeholder="비고">`
            : `<select class="sheet-select" data-col="tax"><option value="">선택</option>${taxOptions}</select>`
        }
        </td>
    `;
    tbody.appendChild(tr);
    lucide.createIcons({ root: tr });
    const typeSelect = tr.querySelector('[data-col="type"]');
    if (typeSelect) updateTypeColor(typeSelect);
}

function updateTypeColor(el) {
    const val = el.value;
    const cell = el.closest('td');
    if (!cell) return;

    cell.classList.remove('type-sale', 'type-support');
    if (val === '판매') cell.classList.add('type-sale');
    if (val === '지원') cell.classList.add('type-support');
}

function renderMiniDashboard(schema) {
    const container = document.getElementById(`mini-dashboard-${schema}`);
    if (!container) return;

    const allData = getDetails(schema);
    const data = getFilteredData(allData);

    const totalAmountSales = data.filter(d => d.type === '판매').reduce((sum, d) => sum + (Number(d.price) || 0), 0);
    const totalAmountSupport = data.filter(d => d.type === '지원').reduce((sum, d) => sum + (Number(d.price) || 0), 0);
    const totalQtySale = data.filter(d => d.type === '판매').reduce((sum, d) => sum + (Number(d.qty) || 0), 0);
    const totalSaleCount = data.filter(d => d.type === '판매').length;
    const totalQtySupport = data.filter(d => d.type === '지원').reduce((sum, d) => sum + (Number(d.qty) || 0), 0);

    // Product breakdown
    const products = ['입오버', '입오버 2P', '중형', '청결제'];
    let productSummary = '';
    products.forEach(p => {
        const pQty = data.filter(d => d.product === p).reduce((sum, d) => sum + (Number(d.qty) || 0), 0);
        if (pQty > 0) {
            productSummary += `<div style="font-size:13px; font-weight:500; color:var(--text-main); background:var(--bg-base); padding:2px 6px; border-radius:4px;">${p} ${pQty.toLocaleString()}</div>`;
        }
    });

    let amountSummaryHtml = `
        <div class="kpi-card" style="padding: 12px; gap: 4px;">
            <div style="font-size:12px; color:var(--text-muted);">총 판매금액</div>
            <div style="font-size:16px; font-weight:700; color:var(--primary);">₩${totalAmountSales.toLocaleString()}</div>
        </div>
        <div class="kpi-card" style="padding: 12px; gap: 4px;">
            <div style="font-size:12px; color:var(--text-muted);">총 지원금액</div>
            <div style="font-size:16px; font-weight:700; color:var(--secondary);">₩${totalAmountSupport.toLocaleString()}</div>
        </div>
    `;

    if (schema === 'online') {
        amountSummaryHtml = `
            <div class="kpi-card" style="padding: 12px; gap: 4px;">
                <div style="font-size:12px; color:var(--text-muted);">총 매출 / 지원금액</div>
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <span style="font-size:16px; font-weight:700; color:var(--primary);">₩${totalAmountSales.toLocaleString()}</span>
                    <span style="font-size:13px; font-weight:600; color:var(--secondary);">지원 ₩${totalAmountSupport.toLocaleString()}</span>
                </div>
            </div>
            <div class="kpi-card" style="padding: 12px; gap: 4px;">
                <div style="font-size:12px; color:var(--text-muted);">총 판매 건수</div>
                <div style="font-size:16px; font-weight:700; color:var(--secondary);">${totalSaleCount.toLocaleString()} 건</div>
            </div>
        `;
    }

    container.innerHTML = `
        ${amountSummaryHtml}
        ${schema !== 'online' ? `
        <div class="kpi-card" style="padding: 12px; gap: 4px;">
            <div style="font-size:12px; color:var(--text-muted);">판매 / 지원 수량</div>
            <div style="font-size:16px; font-weight:700; color:var(--secondary);">${totalQtySale.toLocaleString()}ea <span style="font-size:13px; color:#ef4444; margin-left:4px;">/ ${totalQtySupport.toLocaleString()}ea</span></div>
        </div>` : `
        <div class="kpi-card" style="padding: 12px; gap: 4px;">
            <div style="font-size:12px; color:var(--text-muted);">총 지원수량</div>
            <div style="font-size:16px; font-weight:700; color:#ef4444;">${totalQtySupport.toLocaleString()} ea</div>
        </div>
        `}
        <div class="kpi-card" style="padding: 12px; gap: 4px;">
            <div style="font-size:12px; color:var(--text-muted);">품목별 요약</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:2px;">${productSummary || '<span style="font-size:13px; color:#94a3b8;">데이터 없음</span>'}</div>
        </div>
    `;
}

function addDetailRow(schema) {
    let targetMonth = currentGlobalMonth === 'all' ? '2026-03' : currentGlobalMonth;
    const tbody = document.getElementById(`sheet-${schema}-tbody`);
    appendDetailRow(schema, tbody, { id: generateId(), date: targetMonth + '-01' });
}

function removeDetailRow(btn) {
    btn.closest('tr').remove();
}

function saveCurrentEntrySheet(schema) {
    const rows = document.querySelectorAll(`#sheet-${schema}-tbody tr`);
    let allDetails = getDetails(schema);
    const currentIdsInDom = [];

    rows.forEach(tr => {
        const dateStr = tr.querySelector('[data-col="date"]').value;
        if (!dateStr) return; // Ignore incomplete rows

        const rowData = {
            id: tr.dataset.id,
            date: tr.querySelector('[data-col="date"]').value,
            branch: tr.querySelector('[data-col="branch"]').value,
            type: tr.querySelector('[data-col="type"]').value,
            product: tr.querySelector('[data-col="product"]').value,
            qty: Number(unformat(tr.querySelector('[data-col="qty"]').value)) || 0,
            price: Number(unformat(tr.querySelector('[data-col="price"]').value)) || 0,
            paid: Number(unformat(tr.querySelector('[data-col="paid"]').value)) || 0,
            tax: tr.querySelector('[data-col="tax"]').value
        };

        currentIdsInDom.push(rowData.id);
        const exIdx = allDetails.findIndex(x => x.id === rowData.id);
        if (exIdx > -1) allDetails[exIdx] = rowData;
        else allDetails.push(rowData);
    });

    const originalIdsForMonth = allDetails.filter(d => currentGlobalMonth === 'all' || d.date.startsWith(currentGlobalMonth)).map(d => d.id);
    const deletedIds = originalIdsForMonth.filter(id => !currentIdsInDom.includes(id));
    allDetails = allDetails.filter(d => !deletedIds.includes(d.id));

    saveDetails(schema, allDetails);

    const badge = document.getElementById(`status-${schema}`);
    if (badge) {
        badge.innerHTML = `<i data-lucide="check" style="width:16px; margin-right:4px;"></i> 저장 완료`;
        lucide.createIcons();
        setTimeout(() => { badge.innerHTML = "" }, 3000);
    }
}

function renderInventory() {
    const inv = getInventory();
    const tbody = document.getElementById('sheet-inventory-tbody');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td style="text-align:left; padding-left:24px; font-weight:600; background:var(--bg-surface-hover);">입오버 4P</td>
            <td><input type="text" class="sheet-input" id="inv-4p" value="${inv.panties_4p.toLocaleString()}" onblur="formatNumberInput(this)"></td>
        </tr>
        <tr>
            <td style="text-align:left; padding-left:24px; font-weight:600; background:var(--bg-surface-hover);">입오버 2P</td>
            <td><input type="text" class="sheet-input" id="inv-2p" value="${inv.panties_2p.toLocaleString()}" onblur="formatNumberInput(this)"></td>
        </tr>
        <tr>
            <td style="text-align:left; padding-left:24px; font-weight:600; background:var(--bg-surface-hover);">중형 (Medium)</td>
            <td><input type="text" class="sheet-input" id="inv-medium" value="${inv.medium.toLocaleString()}" onblur="formatNumberInput(this)"></td>
        </tr>
        <tr>
            <td style="text-align:left; padding-left:24px; font-weight:600; background:var(--bg-surface-hover);">청결제 (Cleanser)</td>
            <td><input type="text" class="sheet-input" id="inv-cleanser" value="${inv.cleanser.toLocaleString()}" onblur="formatNumberInput(this)"></td>
        </tr>
    `;
}

function saveInventory() {
    const inv = {
        panties_4p: Number(unformat(document.getElementById('inv-4p').value)) || 0,
        panties_2p: Number(unformat(document.getElementById('inv-2p').value)) || 0,
        medium: Number(unformat(document.getElementById('inv-medium').value)) || 0,
        cleanser: Number(unformat(document.getElementById('inv-cleanser').value)) || 0
    };
    saveInventoryToCloud(inv);
    const badge = document.getElementById('status-inventory');
    if (badge) {
        badge.innerHTML = `<i data-lucide="check" style="width:16px; margin-right:4px;"></i> 저장 완료`;
        lucide.createIcons();
        setTimeout(() => { badge.innerHTML = "" }, 3000);
    }
}

// Spreadsheet Keyboard Navigation (Excel-like Up/Down/Enter)
document.addEventListener('keydown', function (e) {
    if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;
    if (!e.target.classList.contains('sheet-input') && !e.target.classList.contains('sheet-select')) return;

    const currentCell = e.target.closest('td');
    if (!currentCell) return;
    const currentRow = currentCell.closest('tr');
    if (!currentRow) return;

    const tbody = currentRow.closest('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const cells = Array.from(currentRow.querySelectorAll('td'));

    const rowIndex = rows.indexOf(currentRow);
    const colIndex = cells.indexOf(currentCell);

    let nextCell = null;

    if (e.key === 'ArrowUp') {
        if (rowIndex > 0) nextCell = rows[rowIndex - 1].querySelectorAll('td')[colIndex];
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        if (rowIndex < rows.length - 1) nextCell = rows[rowIndex + 1].querySelectorAll('td')[colIndex];
    }

    if (nextCell) {
        const nextInput = nextCell.querySelector('.sheet-input, .sheet-select');
        if (nextInput) {
            e.preventDefault();
            nextInput.focus();
            if (nextInput.tagName === 'INPUT' && (nextInput.type === 'text' || nextInput.type === 'number')) {
                nextInput.select();
            }
        }
    }
});


// ========== 6. Settings ==========
function renderSettings() {
    const tbody = document.querySelector('#table-approvals tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    getUsers().forEach(u => {
        if (u.id === 'admin') return; // Hide root admin

        const isPending = u.status === 'pending';
        const statusHtml = isPending
            ? '<span style="color:#f59e0b; font-weight:600;">승인 대기</span>'
            : '<span style="color:#10b981; font-weight:600;">활동중</span>';

        const roleSelect = `
            <select class="form-control" style="padding:4px; font-size:12px; width:100px;" onchange="updateUserRole('${u.id}', this.value)">
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>회원(조회)</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>부관리자</option>
                <option value="superadmin" ${u.role === 'superadmin' ? 'selected' : ''}>최고관리자</option>
            </select>
        `;

        const actionBtns = isPending
            ? `<button class="btn btn-primary" style="padding:4px 8px; font-size:12px;" onclick="updateUserStatus('${u.id}', 'approved')">승인</button>
               <button class="btn btn-danger" style="padding:4px 8px; font-size:12px; background:#ef4444;" onclick="deleteUser('${u.id}')">거절</button>`
            : `<button class="btn" style="padding:4px 8px; font-size:12px; background:#f3f4f6; color:#ef4444;" onclick="updateUserStatus('${u.id}', 'pending')">승인 취소</button>
               <button class="btn" style="padding:4px 8px; font-size:12px; background:#fee2e2; color:#b91c1c;" onclick="deleteUser('${u.id}')">계정 삭제</button>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.dept} / ${u.position}</td>
                <td>${u.phone || '-'}</td>
                <td>${statusHtml}</td>
                <td>${roleSelect}</td>
                <td><div style="display:flex; gap:4px;">${actionBtns}</div></td>
            </tr>
        `;
    });
}

function updateUserStatus(userId, status) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
        users[idx].status = status;
        saveUsers(users);
        setTimeout(renderSettings, 100);
    }
}

function updateUserRole(userId, role) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
        users[idx].role = role;
        saveUsers(users);
        setTimeout(renderSettings, 100);
    }
}

function deleteUser(userId) {
    if (!confirm('정말로 이 사용자를 삭제(거절)하시겠습니까?')) return;
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    setTimeout(renderSettings, 100);
}

async function resetAppData() {
    if (confirm("모든 데이터를 초기화하고 기본 데모 상태로 돌아갑니다. 진행하시겠습니까?")) {
        localStorage.removeItem('ogasup_sales');
        localStorage.removeItem('ogasup_users');
        localStorage.removeItem('ogasup_inventory');
        localStorage.removeItem('ogasup_details_ipumgo');
        localStorage.removeItem('ogasup_details_neoart');
        localStorage.removeItem('ogasup_details_ogasup');
        localStorage.removeItem('ogasup_details_online');
        localStorage.removeItem('ogasup_app_version'); // Also remove version on full reset
        localStorage.removeItem('activeUser');

        // Note: We intentionally DO NOT remove Firebase data anymore at the user's request.
        // This button now only resets the LOCAL cache and forces a pull from Cloud.

        window.location.reload();
    }
}

// Initial Boot logic
window.onload = async () => {
    // 1. 실시간 동기화 리스너 개방
    initRealtimeSync();

    // 2. 로컬 저장소 기초 데이터 확보 (클라우드 접속 전 최소한의 틀)
    initData(false);

    // 3. 클라우드 데이터 비동기 병합 (성공하면 덮어쓰고, 실패해도 로컬 유지)
    syncAllFromCloud().then(synced => {
        if (synced) {
            console.log("Cloud sync completed on boot.");
            // 데이터가 완전히 동기화된 후 모든 화면 강제 재렌더링
            if (localStorage.getItem('activeUser')) {
                renderDashboard();
                if (currentTab !== 'dashboard') switchMenu(currentTab);
            }
        }
    });

    // 4. 날짜 및 UI 설정
    currentGlobalMonth = '2026-03';
    const filter = document.getElementById('globalMonthFilter');
    if (filter) filter.value = '2026-03';

    // 5. 로그인 유지 확인
    const savedUser = localStorage.getItem('activeUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const users = getUsers();
            const latest = users.find(u => u.id === user.id);

            // 최고관리자이거나 승인된 유저면 대시보드 진입
            if (user.id === 'admin' || (latest && latest.status === 'approved')) {
                if (latest) localStorage.setItem('activeUser', JSON.stringify(latest));
                enterDashboard();
            } else {
                localStorage.removeItem('activeUser');
                switchMenu('dashboard');
            }
        } catch (e) {
            localStorage.removeItem('activeUser');
            switchMenu('dashboard');
        }
    } else {
        switchMenu('dashboard');
    }
}
