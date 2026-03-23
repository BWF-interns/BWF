/* ──────────────────────────────────────────────────────────────
   BWF Portal — Demo Data & API Shim
   All data is hardcoded. No backend required.
   ────────────────────────────────────────────────────────────── */

const DEMO_USER = { name: 'Ravi Admin', role: 'admin' };

// ── Helpers ────────────────────────────────────────────────────
function formatINR(n) {
    if (!n && n !== 0) return '₹0';
    return '₹' + Number(n).toLocaleString('en-IN');
}
function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function noop() {}
function requireAdmin() { /* demo: always authorized */ }

// ── Sidebar init shim ──────────────────────────────────────────
function initStaffSidebar(options = {}) {
    const el = document.getElementById('staff-name');
    if (el) el.textContent = DEMO_USER.name;
    const av = document.getElementById('staff-avatar');
    if (av) av.textContent = getInitials(DEMO_USER.name);
    const rl = document.getElementById('staff-role');
    if (rl) rl.textContent = 'Administrator';
    const badge = document.getElementById('staff-badge');
    if (badge) badge.textContent = 'DEMO MODE';
    // highlight active nav link based on page
    document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.remove('active');
        if (window.location.href.includes(a.getAttribute('href'))) a.classList.add('active');
    });
}
function staffLogout() { window.location.href = '../index.html'; }

// ── Toast ──────────────────────────────────────────────────────
function showStaffToast(title, sub, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background:#1e2235;border:1px solid rgba(255,255,255,0.1);border-left:3px solid ${type==='success'?'#10b981':type==='error'?'#ef4444':'#3b82f6'};border-radius:12px;padding:14px 16px;min-width:280px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:fadeIn 0.2s ease`;
    toast.innerHTML = `<strong style="font-size:13px;color:#f1f5f9">${title}</strong>${sub ? `<p style="font-size:12px;color:#64748b;margin-top:2px">${sub}</p>` : ''}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── Demo data ──────────────────────────────────────────────────
const STUDENTS = [
    { id:'STU001', name:'Aisha Mir',       house:'House A', program:'Basera-e-Tabassum', class:'10th', bg:'Orphan',  xp:1240, consent:true  },
    { id:'STU002', name:'Fatima Khan',     house:'House A', program:'Basera-e-Tabassum', class:'8th',  bg:'Orphan',  xp:980,  consent:true  },
    { id:'STU003', name:'Zara Bhat',       house:'House A', program:'Foster A Home',      class:'9th',  bg:'Widow child', xp:760, consent:false },
    { id:'STU004', name:'Hina Lone',       house:'House B', program:'Basera-e-Tabassum', class:'7th',  bg:'Orphan',  xp:1100, consent:true  },
    { id:'STU005', name:'Sara Qureshi',    house:'House B', program:'Rah-e-Niswan',       class:'11th', bg:'Conflict-affected', xp:890, consent:true },
    { id:'STU006', name:'Nadia Sheikh',    house:'House B', program:'Foster A Home',      class:'6th',  bg:'Orphan',  xp:640,  consent:false },
    { id:'STU007', name:'Ruqaiya Ahmad',   house:'House C', program:'Basera-e-Tabassum', class:'10th', bg:'Migrant', xp:1320, consent:true  },
    { id:'STU008', name:'Mariam Dar',      house:'House C', program:'Rah-e-Niswan',       class:'12th', bg:'Widow child', xp:1550, consent:true },
    { id:'STU009', name:'Sobia Nawaz',     house:'House A', program:'Basera-e-Tabassum', class:'9th',  bg:'Orphan',  xp:820,  consent:false },
    { id:'STU010', name:'Amina Bashir',    house:'House B', program:'Foster A Home',      class:'8th',  bg:'Orphan',  xp:710,  consent:true  },
    { id:'STU011', name:'Khadija Rafiq',   house:'House A', program:'Basera-e-Tabassum', class:'11th', bg:'Conflict-affected', xp:960, consent:true },
    { id:'STU012', name:'Lubna Wani',      house:'House C', program:'Foster A Home',      class:'7th',  bg:'Orphan',  xp:580,  consent:true  },
    { id:'STU013', name:'Tahira Butt',     house:'House B', program:'Basera-e-Tabassum', class:'10th', bg:'Migrant', xp:1080, consent:false },
    { id:'STU014', name:'Razia Gul',       house:'House A', program:'Rah-e-Niswan',       class:'12th', bg:'Orphan',  xp:1410, consent:true  },
    { id:'STU015', name:'Nasreen Sofi',    house:'House C', program:'Basera-e-Tabassum', class:'9th',  bg:'Widow child', xp:870, consent:true },
    { id:'STU016', name:'Bilal Hassan',    house:'House A', program:'Basera-e-Tabassum', class:'8th',  bg:'Orphan',  xp:920,  consent:true  },
    { id:'STU017', name:'Omar Farooq',     house:'House B', program:'Foster A Home',      class:'10th', bg:'Orphan',  xp:1050, consent:true  },
    { id:'STU018', name:'Arif Nabi',       house:'House C', program:'Basera-e-Tabassum', class:'11th', bg:'Conflict-affected', xp:1180, consent:true },
];

const STAFF = [
    { name:'Sister Zara Hussain', email:'housemother@bwf.org', role:'Housemother', house:'House A', type:'Paid Employee', caseload:6, status:'Active' },
    { name:'Sister Noor Fatima',  email:'noor@bwf.org',        role:'Housemother', house:'House B', type:'Paid Employee', caseload:6, status:'Active' },
    { name:'Sister Hafsa Mir',    email:'hafsa@bwf.org',       role:'Housemother', house:'House C', type:'Paid Employee', caseload:6, status:'Active' },
    { name:'Dr. Fatima Shah',     email:'dean@bwf.org',        role:'Dean/Warden', house:'All',     type:'Paid Employee', caseload:18, status:'Active' },
    { name:'Mr. Wasim Ahmed',     email:'wasim@bwf.org',       role:'Counsellor',  house:'All',     type:'Volunteer',    caseload:12, status:'Active' },
    { name:'Ms. Rabia Khan',      email:'rabia@bwf.org',       role:'Tutor',       house:'All',     type:'Volunteer',    caseload:10, status:'Active' },
    { name:'Dr. Imran Rashid',    email:'imran@bwf.org',       role:'Doctor',      house:'All',     type:'Consultant',   caseload:18, status:'Active' },
    { name:'Mr. Tariq Lone',      email:'tariq@bwf.org',       role:'Teacher',     house:'All',     type:'Volunteer',    caseload:8,  status:'Departed' },
];

const EXPENSES = [
    { title:'Monthly Ration — House A',     amount:28000, category:'Program/Mission',       date:'Mar 15, 2026', status:'Paid',     by:'Sister Zara' },
    { title:'Monthly Ration — House B',     amount:26500, category:'Program/Mission',       date:'Mar 15, 2026', status:'Paid',     by:'Sister Noor' },
    { title:'Annual Medical Camp',          amount:45000, category:'Medical Emergency',     date:'Mar 10, 2026', status:'Paid',     by:'Dr. Imran' },
    { title:'Education Materials Q1',       amount:18000, category:'Program/Mission',       date:'Mar 5, 2026',  status:'Approved', by:'Dr. Fatima' },
    { title:'Website & IT Infrastructure',  amount:12000, category:'Overhead/Admin',        date:'Feb 28, 2026', status:'Paid',     by:'Admin' },
    { title:'Digital Fundraising Campaign', amount:8500,  category:'Fundraising Investment',date:'Feb 20, 2026', status:'Paid',     by:'Admin' },
    { title:'Staff Training Workshop',      amount:15000, category:'Overhead/Admin',        date:'Feb 10, 2026', status:'Paid',     by:'Dr. Fatima' },
    { title:'Eid Celebration & Gifts',      amount:22000, category:'Program/Mission',       date:'Feb 1, 2026',  status:'Approved', by:'Admin' },
    { title:'Monthly Ration — House C',     amount:24000, category:'Program/Mission',       date:'Mar 15, 2026', status:'Pending',  by:'Sister Hafsa' },
    { title:'Stationery & Books Q2',        amount:9500,  category:'Program/Mission',       date:'Mar 20, 2026', status:'Pending',  by:'Ms. Rabia' },
];

const POSTS = [
    { student:'Mariam Dar',    house:'House C', caption:'Completed my Math project! 📐', status:'pending', date:'Mar 22, 2026' },
    { student:'Ruqaiya Ahmad', house:'House C', caption:'Art class today was so fun 🎨',  status:'pending', date:'Mar 21, 2026' },
    { student:'Aisha Mir',     house:'House A', caption:'Reading hour at the library 📚',  status:'approved', hof:true, date:'Mar 18, 2026' },
    { student:'Fatima Khan',   house:'House A', caption:'Won the spelling bee! 🏆',        status:'approved', hof:false, date:'Mar 16, 2026' },
    { student:'Sara Qureshi',  house:'House B', caption:'Class presentation done! Proud 💪',status:'approved', hof:false, date:'Mar 14, 2026' },
    { student:'Bilal Hassan',  house:'House A', caption:'Football practice 🙏',            status:'rejected', date:'Mar 12, 2026' },
];

// ── DemoAPI ────────────────────────────────────────────────────
const DemoAPI = {
    overview() {
        return Promise.resolve({ data: {
            totalStudents: STUDENTS.length,
            activeStaff: STAFF.filter(s => s.status==='Active').length,
            pendingRequests: 6, urgentRequests: 2,
            pendingPosts: POSTS.filter(p => p.status==='pending').length,
            consentMissing: STUDENTS.filter(s => !s.consent).length,
            thisMonthExpenses: 103000, thisYearDonations: 1250000,
            pendingExpenses: EXPENSES.filter(e => e.status==='Pending').length,
            totalExpenses: 870000, totalDonations: 1250000
        }});
    },
    welfare() {
        const byProgram = [
            { _id:'Basera-e-Tabassum', count: STUDENTS.filter(s=>s.program==='Basera-e-Tabassum').length },
            { _id:'Foster A Home',      count: STUDENTS.filter(s=>s.program==='Foster A Home').length },
            { _id:'Rah-e-Niswan',       count: STUDENTS.filter(s=>s.program==='Rah-e-Niswan').length },
        ];
        const byHomeGroup = [
            { _id:'House A', count: STUDENTS.filter(s=>s.house==='House A').length },
            { _id:'House B', count: STUDENTS.filter(s=>s.house==='House B').length },
            { _id:'House C', count: STUDENTS.filter(s=>s.house==='House C').length },
        ];
        const byBackground = [
            { _id:'Orphan', count:10 }, { _id:'Widow child', count:4 },
            { _id:'Conflict-affected', count:3 }, { _id:'Migrant', count:2 }
        ];
        const avgXP = Math.round(STUDENTS.reduce((s,st)=>s+st.xp,0)/STUDENTS.length);
        return Promise.resolve({ data: { byProgram, byHomeGroup, byGender:[{_id:'Female',count:15},{_id:'Male',count:3}], byBackground, avgXP, avgStreak:12 }});
    },
    compliance() {
        const students = STUDENTS.map(s => ({
            _id: s.id,
            studentId: s.id,
            user: { name: s.name },
            homeGroup: s.house,
            bwfProgram: s.program,
            guardianConsent: s.consent,
            dpdpConsent: { isVerified: s.consent, verificationMethod: s.consent ? 'Offline Form' : null },
            joinDate: s.consent ? '2025-09-01' : '2025-07-01',
        }));
        return Promise.resolve({ data: {
            total: students.length,
            consentMissing: students.filter(s=>!s.guardianConsent).length,
            dpdpVerified: students.filter(s=>s.guardianConsent).length,
            retentionRisk: students.filter(s=>!s.guardianConsent).length,
            students
        }});
    },
    risk() {
        return Promise.resolve({ data: {
            medicalSpike: true,
            medicalRequestsThisWeek: 4, medicalRequestsLastWeek: 2,
            disengagedCount: 3,
            riskRadar: { medicalRisk:4, engagementRisk:3, urgencyRisk:5, consentRisk:3, mediaRisk:2 }
        }});
    },
    finance() {
        const expensesByCategory = [
            { _id:'Program/Mission',       total:594000, count:6 },
            { _id:'Overhead/Admin',        total:130000, count:3 },
            { _id:'Medical Emergency',     total:105000, count:2 },
            { _id:'Fundraising Investment',total: 41000, count:1 },
        ];
        const totalExpenses = expensesByCategory.reduce((s,c)=>s+c.total,0);
        return Promise.resolve({ data: {
            totalRaised: 1250000, totalExpenses,
            netBalance: 1250000 - totalExpenses,
            programEfficiencyRatio: Math.round((594000/totalExpenses)*100),
            overheadRatio: Math.round((130000/totalExpenses)*100),
            fundraisingROI: Math.round(1250000/41000),
            costPerBeneficiary: Math.round(594000/STUDENTS.length),
            donorRetentionRate: 68, totalDonors: 34, recurringDonors: 23,
            expensesByCategory,
            recentExpenses: EXPENSES,
        }});
    },
    staff() {
        const active = STAFF.filter(s=>s.status==='Active').length;
        const departed = STAFF.filter(s=>s.status==='Departed').length;
        return Promise.resolve({ data: {
            staffList: STAFF.map((s,i)=>({_id:i, name:s.name, email:s.email, role:s.role, homeGroup:s.house, staffType:s.type, caseloadSize:s.caseload, status:s.status})),
            active, departed, turnoverRatio: Math.round((departed/active)*100),
            expiringCerts: [{ staffName:'Mr. Wasim Ahmed', cert:'Child Protection Training', expiryDate:'2026-04-15' }]
        }});
    },
    posts() {
        return Promise.resolve({ pending: POSTS.filter(p=>p.status==='pending'), approved: POSTS.filter(p=>p.status==='approved'), rejected: POSTS.filter(p=>p.status==='rejected') });
    },
    recordConsent(id) {
        const s = STUDENTS.find(st=>st.id===id);
        if (s) s.consent = true;
        showStaffToast('✅ Consent Recorded', 'Audit trail updated');
        return Promise.resolve({ success: true });
    }
};
