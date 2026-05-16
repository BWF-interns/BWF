// BWF-Backend/seedHomeRecords.js
// Seeds all mandated Home Records (JJ Act Rule 21 & 22) for all 4 homes.
// Also seeds Student documents from BWF-data/tmp_students.json
// Run: node seedHomeRecords.js

require('dotenv').config();
const mongoose = require('mongoose');
const HomeRecord = require('./models/HomeRecord');
const Student = require('./student/models/student');

const HOMES = ['Jammu', 'Anantnag', 'Kupwara', 'Beerwah'];

// All mandated shared registers per home (JJ Model Rules 2016)
const SHARED_REGISTERS = [
  // Admission & Discharge
  { category: 'admission_register',     title: 'Admission Register',              fileType: 'shared_register' },
  { category: 'discharge_register',     title: 'Discharge / Restoration Register',fileType: 'shared_register' },
  // CWC & Legal
  { category: 'cwc_order_file',         title: 'CWC Order File',                  fileType: 'shared_register' },
  { category: 'production_register',    title: 'Production Register',             fileType: 'shared_register' },
  { category: 'case_followup_file',     title: 'Case Follow-up File',             fileType: 'shared_register' },
  { category: 'court_documents',        title: 'Court-related Documents File',    fileType: 'shared_register' },
  // Health
  { category: 'medical_register',       title: 'Medical Register',                fileType: 'shared_register' },
  { category: 'immunization_records',   title: 'Immunization Records Register',   fileType: 'shared_register' },
  { category: 'sick_register',          title: 'Sick Register',                   fileType: 'shared_register' },
  { category: 'referral_records',       title: 'Hospital Referral Records',       fileType: 'shared_register' },
  // Nutrition & Daily Care
  { category: 'diet_register',          title: 'Diet Register',                   fileType: 'shared_register' },
  { category: 'stock_register',         title: 'Stock Register (Food & Essentials)', fileType: 'shared_register' },
  { category: 'daily_routine_register', title: 'Daily Routine Register',          fileType: 'shared_register' },
  // Education & Activities
  { category: 'education_register',     title: 'Education Register',              fileType: 'shared_register' },
  { category: 'vocational_training',    title: 'Vocational Training Records',     fileType: 'shared_register' },
  { category: 'attendance_register',    title: 'Attendance Register',             fileType: 'shared_register' },
  { category: 'activity_file',          title: 'Activity / Skill Development File', fileType: 'shared_register' },
  // Staff & Admin
  { category: 'staff_attendance',       title: 'Staff Attendance Register',       fileType: 'shared_register' },
  { category: 'staff_personal_files',   title: 'Staff Personal Files',            fileType: 'shared_register' },
  { category: 'duty_roster',            title: 'Duty Roster',                     fileType: 'shared_register' },
  { category: 'leave_records',          title: 'Staff Leave Records',             fileType: 'shared_register' },
  // Financial
  { category: 'cash_book',              title: 'Cash Book',                       fileType: 'shared_register' },
  { category: 'ledger',                 title: 'Ledger',                          fileType: 'shared_register' },
  { category: 'budget_expenditure',     title: 'Budget & Expenditure File',       fileType: 'shared_register' },
  { category: 'donation_register',      title: 'Donation Register',               fileType: 'shared_register' },
  // Inspection & Monitoring
  { category: 'inspection_register',    title: 'Inspection Register',             fileType: 'shared_register' },
  { category: 'visitors_book',          title: "Visitor's Book",                  fileType: 'shared_register' },
  { category: 'complaint_register',     title: 'Suggestion / Complaint Register', fileType: 'shared_register' },
  { category: 'social_audit_report',    title: 'Social Audit Reports',            fileType: 'shared_register' },
  // Misc / Legal
  { category: 'ngo_registration',       title: 'NGO Registration & Licenses File',fileType: 'shared_register' },
];

// Per-child file types to create for every student
const CHILD_FILE_TYPES = [
  { category: 'SIR',              title: 'Social Investigation Report (SIR)' },
  { category: 'ICP',              title: 'Individual Care Plan (ICP)' },
  { category: 'medical_records',  title: 'Medical Records' },
  { category: 'education_records',title: 'Education Records' },
  { category: 'counseling_notes', title: 'Counseling / Rehabilitation Notes' },
  { category: 'restoration_report', title: 'Restoration & Follow-up Report' },
];

// Raw student names from BWF-data (parsed from Excel)
const RAW_STUDENTS = [
  { name: 'Sonam Palmo',       home: 'Jammu' },
  { name: 'Bhawana',           home: 'Jammu' },
  { name: 'Rigzin',            home: 'Jammu' },
  { name: 'Bhavya',            home: 'Jammu' },
  { name: 'Sadaf',             home: 'Jammu' },
  { name: 'Nilza',             home: 'Jammu' },
  { name: 'Thinles',           home: 'Jammu' },
  { name: 'Nawang',            home: 'Jammu' },
  { name: 'Suriyah',           home: 'Jammu' },
  { name: 'Tsering',           home: 'Jammu' },
  { name: 'Sonam Angmo',       home: 'Jammu' },
  { name: 'Annu Devi',         home: 'Jammu' },
  { name: 'Diskit',            home: 'Jammu' },
  { name: 'Mepham Lamo',       home: 'Jammu' },
  { name: 'Tundup lamo',       home: 'Jammu' },
  { name: 'Lavanya Choudary',  home: 'Jammu' },
  { name: 'Archana Sharma',    home: 'Jammu' },
  { name: 'Jyoti Bala',        home: 'Jammu' },
  { name: 'Punchok chosdon',   home: 'Jammu' },
  { name: 'Tashi yanskit',     home: 'Jammu' },
  { name: 'Sanjeeta Devi',     home: 'Jammu' },
  { name: 'Jeevika',           home: 'Jammu' },
  { name: 'Yangzes',           home: 'Jammu' },
  { name: 'Stanzin',           home: 'Jammu' },
  { name: 'Madhu',             home: 'Jammu' },
  { name: 'Meenakshi',         home: 'Jammu' },
  { name: 'Lazes',             home: 'Jammu' },
  { name: 'Shreya',            home: 'Jammu' },
  { name: 'Radhika',           home: 'Jammu' },
  { name: 'Kamran',            home: 'Jammu' },
  { name: 'Shivansh',          home: 'Jammu' },
  { name: 'Shivay',            home: 'Jammu' },
  { name: 'Aarizu',            home: 'Jammu' },
  { name: 'Shanu Devi',        home: 'Jammu' },
  { name: 'Hoor',              home: 'Jammu' },
  { name: 'Varsha',            home: 'Jammu' },
  // Beerwah
  { name: 'Gazala Sikandar',   home: 'Beerwah' },
  { name: 'Lubna Ali',         home: 'Beerwah' },
  { name: 'Khair ul Anim',     home: 'Beerwah' },
  { name: 'Insha Akther',      home: 'Beerwah' },
  { name: 'Tanveera',          home: 'Beerwah' },
  { name: 'Rayeesa Nazir',     home: 'Beerwah' },
  { name: 'Rabia',             home: 'Beerwah' },
  { name: 'Asmat Gani',        home: 'Beerwah' },
  { name: 'Rutba',             home: 'Beerwah' },
  { name: 'Rahila Shabir',     home: 'Beerwah' },
  { name: 'Seerat',            home: 'Beerwah' },
  { name: 'Sadiya',            home: 'Beerwah' },
  { name: 'Haya Nazir',        home: 'Beerwah' },
  { name: 'Humaira',           home: 'Beerwah' },
  { name: 'Azra Parviz',       home: 'Beerwah' },
  { name: 'Kushboo Rahim',     home: 'Beerwah' },
  { name: 'Asmat Mohiudin',    home: 'Beerwah' },
  { name: 'Kulsooma',          home: 'Beerwah' },
  { name: 'Tawfeeqa Bano',     home: 'Beerwah' },
  { name: 'Safeena Asad',      home: 'Beerwah' },
  { name: 'Aira',              home: 'Beerwah' },
  { name: 'Shahida',           home: 'Beerwah' },
  { name: 'Ishrat Shafi',      home: 'Beerwah' },
  { name: 'Kulsooma Shafi',    home: 'Beerwah' },
  { name: 'Zainab Ali',        home: 'Beerwah' },
  { name: 'Rabiya Mohiudin',   home: 'Beerwah' },
  { name: 'Zanib Hilal',       home: 'Beerwah' },
  { name: 'Misrat Manzoor',    home: 'Beerwah' },
  { name: 'Hibaba Bilal',      home: 'Beerwah' },
  { name: 'Shabnum Mushtaq',   home: 'Beerwah' },
  { name: 'Misba Mushtaq',     home: 'Beerwah' },
  // Anantnag
  { name: 'Munaza Jan',        home: 'Anantnag' },
  { name: 'Yasmeena M',        home: 'Anantnag' },
  { name: 'Yasmeena N',        home: 'Anantnag' },
  { name: 'Sufiya',            home: 'Anantnag' },
  { name: 'Iqra',              home: 'Anantnag' },
  { name: 'Sehru',             home: 'Anantnag' },
  { name: 'Salma',             home: 'Anantnag' },
  { name: 'Mehak',             home: 'Anantnag' },
  { name: 'Rehana',            home: 'Anantnag' },
  { name: 'Shaziya',           home: 'Anantnag' },
  { name: 'Seerat',            home: 'Anantnag' },
  { name: 'Mariyam',           home: 'Anantnag' },
  { name: 'Wasika',            home: 'Anantnag' },
  { name: 'Rifat',             home: 'Anantnag' },
  { name: 'Tasmeena',          home: 'Anantnag' },
  { name: 'Nageena Akther',    home: 'Anantnag' },
  { name: 'Parveena Akther',   home: 'Anantnag' },
  { name: 'Salfie',            home: 'Anantnag' },
  { name: 'Hoorain',           home: 'Anantnag' },
  { name: 'Nasreena Akther',   home: 'Anantnag' },
  { name: 'Sehrish Jan',       home: 'Anantnag' },
  { name: 'Nusrat Jan',        home: 'Anantnag' },
  { name: 'Naseera Jan',       home: 'Anantnag' },
  { name: 'Tobia Ishfaq',      home: 'Anantnag' },
  { name: 'Kushboo Jan',       home: 'Anantnag' },
  { name: 'Aamina Jan',        home: 'Anantnag' },
  { name: 'Abru',              home: 'Anantnag' },
  { name: 'Raziya Jan',        home: 'Anantnag' },
  { name: 'Rashida Jan',       home: 'Anantnag' },
  { name: 'Tahira Jan',        home: 'Anantnag' },
  { name: 'Shabnum Jan',       home: 'Anantnag' },
  { name: 'Sehrish Jan (2)',   home: 'Anantnag' },
  { name: 'Andeeba',           home: 'Anantnag' },
  // Kupwara
  { name: 'Nida Mir',          home: 'Kupwara' },
  { name: 'Muskan Bashir',     home: 'Kupwara' },
  { name: 'Saniya',            home: 'Kupwara' },
  { name: 'Mehreena',          home: 'Kupwara' },
  { name: 'Samreena',          home: 'Kupwara' },
  { name: 'Mehvish',           home: 'Kupwara' },
  { name: 'Nasreena',          home: 'Kupwara' },
  { name: 'Afreena',           home: 'Kupwara' },
  { name: 'Shahzada',          home: 'Kupwara' },
  { name: 'Bisma',             home: 'Kupwara' },
  { name: 'Rabiya',            home: 'Kupwara' },
  { name: 'Sufoora',           home: 'Kupwara' },
  { name: 'Rutba',             home: 'Kupwara' },
  { name: 'Seerat Khan',       home: 'Kupwara' },
  { name: 'Arbeena',           home: 'Kupwara' },
  { name: 'Fizrat',            home: 'Kupwara' },
  { name: 'Tanzeela',          home: 'Kupwara' },
  { name: 'Seerat R',          home: 'Kupwara' },
  { name: 'Ronak',             home: 'Kupwara' },
  { name: 'Uzma',              home: 'Kupwara' },
  { name: 'Midhat',            home: 'Kupwara' },
  { name: 'Zunain',            home: 'Kupwara' },
  { name: 'Areeba',            home: 'Kupwara' },
  { name: 'Faiqa',             home: 'Kupwara' },
  { name: 'Toiba',             home: 'Kupwara' },
  { name: 'Shaima',            home: 'Kupwara' },
  { name: 'Sadaiya',           home: 'Kupwara' },
  { name: 'Moomina',           home: 'Kupwara' },
  { name: 'Ulfat',             home: 'Kupwara' },
  { name: 'Shaziya',           home: 'Kupwara' },
  { name: 'Sufaya Sultan',     home: 'Kupwara' },
  { name: 'Seerat Sultan',     home: 'Kupwara' },
  { name: 'Sania Sultan',      home: 'Kupwara' },
  { name: 'Romana Sultan',     home: 'Kupwara' },
];

async function seed() {
  const uri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/bwf_db';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // ── 1. Seed Students into Student collection ──────────────────────────
  let studentsSeeded = 0;
  for (const s of RAW_STUDENTS) {
    const exists = await Student.findOne({ name: s.name, home: s.home });
    if (!exists) {
      await Student.create({ name: s.name.trim(), home: s.home, status: 'active' });
      studentsSeeded++;
    }
  }
  console.log(`Students seeded: ${studentsSeeded} new`);

  // ── 2. Seed shared registers for each home ────────────────────────────
  let registersSeeded = 0;
  for (const home of HOMES) {
    for (const reg of SHARED_REGISTERS) {
      const exists = await HomeRecord.findOne({ home, category: reg.category, fileType: 'shared_register' });
      if (!exists) {
        await HomeRecord.create({
          home,
          category:      reg.category,
          title:         reg.title,
          fileType:      'shared_register',
          status:        'active',
          createdBy:     'system',
          ruleReference: 'JJ Model Rules 2016, Rule 21 & 22',
        });
        registersSeeded++;
      }
    }
  }
  console.log(`Shared registers seeded: ${registersSeeded} new`);

  // ── 3. Seed per-child files for every student ─────────────────────────
  const allStudents = await Student.find({});
  let childFilesSeeded = 0;
  for (const child of allStudents) {
    for (const ft of CHILD_FILE_TYPES) {
      const exists = await HomeRecord.findOne({
        childId:  String(child._id),
        category: ft.category,
        fileType: 'per_child',
      });
      if (!exists) {
        await HomeRecord.create({
          home:      child.home,
          category:  ft.category,
          title:     `${ft.title} — ${child.name}`,
          fileType:  'per_child',
          childId:   String(child._id),
          childName: child.name,
          status:    'active',
          createdBy: 'system',
          ruleReference: 'JJ Model Rules 2016, Rule 21 & 22',
        });
        childFilesSeeded++;
      }
    }
  }
  console.log(`Per-child files seeded: ${childFilesSeeded} new`);
  console.log('\n✅ Seeding complete.');
  console.log(`   Total Home Records in DB: ${await HomeRecord.countDocuments()}`);
  console.log(`   Total Students in DB:     ${await Student.countDocuments()}`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
