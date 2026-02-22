require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Student = require('../models/Student');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const { Task } = require('../models/Task');

const seed = async () => {
    await connectDB();
    console.log('🌱 Seeding BWF database...');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}), Student.deleteMany({}),
        Topic.deleteMany({}), Question.deleteMany({}), Task.deleteMany({})
    ]);

    // Create Admin
    const adminUser = await User.create({
        name: 'BWF Admin',
        email: 'admin@bwf.org',
        password: 'admin123',
        role: 'admin'
    });

    // Create Dean
    const deanUser = await User.create({
        name: 'Dr. Fatima Malik',
        email: 'dean@bwf.org',
        password: 'dean123',
        role: 'dean'
    });

    // Create Housemother
    const housemotherUser = await User.create({
        name: 'Sister Zara',
        email: 'housemother@bwf.org',
        password: 'house123',
        role: 'housemother'
    });

    // Create Student Users
    const studentUsers = await User.insertMany([
        { name: 'Aisha Khan', email: 'aisha@bwf.org', password: await bcrypt.hash('student123', 12), role: 'student' },
        { name: 'Sana Mir', email: 'sana@bwf.org', password: await bcrypt.hash('student123', 12), role: 'student' },
        { name: 'Razia Bano', email: 'razia@bwf.org', password: await bcrypt.hash('student123', 12), role: 'student' },
        { name: 'Noor Fatima', email: 'noor@bwf.org', password: await bcrypt.hash('student123', 12), role: 'student' },
        { name: 'Maryam Shah', email: 'maryam@bwf.org', password: await bcrypt.hash('student123', 12), role: 'student' },
    ]);

    // Create Student profiles
    const studentProfiles = await Student.insertMany([
        {
            user: studentUsers[0]._id, studentId: 'BWF-2024-001',
            dateOfBirth: new Date('2010-03-15'), gender: 'female', height: 152, weight: 42, bloodGroup: 'B+',
            healthDetails: { medicalConditions: [], allergies: ['Dust'], medications: [], notes: 'Generally healthy' },
            familyDetails: { guardianName: 'Uncle Tariq', guardianContact: '9876543210', siblings: 2, background: 'orphan', address: 'Srinagar, Kashmir' },
            education: { currentClass: '7th', school: 'Govt Middle School Srinagar', board: 'JKBOSE', admissionYear: 2021 },
            careerGoal: 'AI Engineer', interests: ['Technology', 'Mathematics', 'Drawing'],
            totalPoints: 320, level: 3, streak: 5, admittedBy: adminUser._id, roomNumber: 'A-102'
        },
        {
            user: studentUsers[1]._id, studentId: 'BWF-2024-002',
            dateOfBirth: new Date('2011-07-22'), gender: 'female', height: 148, weight: 39, bloodGroup: 'A+',
            healthDetails: { medicalConditions: ['Asthma'], allergies: [], medications: ['Inhaler'], notes: 'Needs inhaler during exercise' },
            familyDetails: { guardianName: 'Aunt Ruhi', guardianContact: '9812345678', siblings: 1, background: 'semi-orphan', address: 'Baramulla, Kashmir' },
            education: { currentClass: '6th', school: 'Govt Girls School Srinagar', board: 'JKBOSE', admissionYear: 2022 },
            careerGoal: 'Doctor', interests: ['Science', 'Reading', 'Music'],
            totalPoints: 180, level: 2, streak: 2, admittedBy: adminUser._id, roomNumber: 'A-103'
        },
        {
            user: studentUsers[2]._id, studentId: 'BWF-2024-003',
            dateOfBirth: new Date('2009-11-08'), gender: 'female', height: 158, weight: 47, bloodGroup: 'O+',
            healthDetails: { medicalConditions: [], allergies: [], medications: [], notes: '' },
            familyDetails: { guardianName: 'BWF Foundation', guardianContact: '', siblings: 0, background: 'orphan', address: 'Anantnag, Kashmir' },
            education: { currentClass: '9th', school: 'Govt High School Srinagar', board: 'JKBOSE', admissionYear: 2020 },
            careerGoal: 'Teacher', interests: ['Languages', 'Arts', 'Environment'],
            totalPoints: 540, level: 5, streak: 12, admittedBy: adminUser._id, roomNumber: 'B-101'
        },
        {
            user: studentUsers[3]._id, studentId: 'BWF-2024-004',
            dateOfBirth: new Date('2012-01-30'), gender: 'female', height: 142, weight: 36, bloodGroup: 'AB+',
            familyDetails: { guardianName: 'BWF Foundation', siblings: 3, background: 'orphan', address: 'Pulwama, Kashmir' },
            education: { currentClass: '5th', school: 'Govt Primary School Srinagar', board: 'JKBOSE', admissionYear: 2023 },
            careerGoal: 'Pilot', interests: ['Science', 'Mathematics'],
            totalPoints: 90, level: 1, streak: 1, admittedBy: adminUser._id, roomNumber: 'A-104'
        },
        {
            user: studentUsers[4]._id, studentId: 'BWF-2024-005',
            dateOfBirth: new Date('2010-09-14'), gender: 'female', height: 154, weight: 44, bloodGroup: 'B-',
            familyDetails: { guardianName: 'Grandmother Hawa Bi', guardianContact: '9891234567', siblings: 4, background: 'semi-orphan', address: 'Kupwara, Kashmir' },
            education: { currentClass: '8th', school: 'Govt High School Srinagar', board: 'JKBOSE', admissionYear: 2021 },
            careerGoal: 'Software Developer', interests: ['Technology', 'AI & Machine Learning', 'Mathematics'],
            totalPoints: 410, level: 4, streak: 8, admittedBy: adminUser._id, roomNumber: 'B-102'
        },
    ]);

    // Create Topics
    const topics = await Topic.insertMany([
        {
            title: 'Introduction to Artificial Intelligence',
            description: 'Discover how AI is changing the world and learn the basics of machine learning!',
            category: 'AI & Machine Learning', icon: '🤖', difficulty: 'beginner',
            pointsReward: 80, estimatedTime: '45 min',
            resources: [
                { title: 'What is AI? - Beginner Guide', type: 'youtube', url: 'https://www.youtube.com/watch?v=ad79nYk2keg', description: 'Simple explanation of AI for beginners', duration: '8 min' },
                { title: 'AI for Kids - BBC', type: 'blog', url: 'https://www.bbc.com/bitesize/articles/zk98kty', description: 'Easy to understand AI concepts' },
                { title: 'Machine Learning for Kids', type: 'documentation', url: 'https://machinelearningforkids.co.uk/', description: 'Interactive ML platform' }
            ],
            tags: ['AI', 'machine learning', 'technology', 'future']
        },
        {
            title: 'Learn Python Programming Basics',
            description: 'Start coding with Python – the language used by AI engineers and scientists!',
            category: 'Technology', icon: '🐍', difficulty: 'beginner',
            pointsReward: 100, estimatedTime: '60 min',
            resources: [
                { title: 'Python for Beginners', type: 'youtube', url: 'https://www.youtube.com/watch?v=7utwfQ3R-wQ', description: 'Python tutorial from scratch', duration: '15 min' },
                { title: 'Python.org Beginners Guide', type: 'documentation', url: 'https://wiki.python.org/moin/BeginnersGuide', description: 'Official Python beginner resources' },
                { title: 'Repl.it - Code Online Free', type: 'blog', url: 'https://replit.com/', description: 'Free online coding environment' }
            ],
            tags: ['python', 'coding', 'programming', 'technology']
        },
        {
            title: 'Spoken English for Beginners',
            description: 'Build confidence in speaking English with simple lessons and everyday conversations!',
            category: 'Languages', icon: '🗣️', difficulty: 'beginner',
            pointsReward: 60, estimatedTime: '30 min',
            resources: [
                { title: 'Everyday English Conversations', type: 'youtube', url: 'https://www.youtube.com/watch?v=kFGs-NElmrg', description: 'Common English phrases for daily use', duration: '12 min' },
                { title: 'BBC Learning English', type: 'blog', url: 'https://www.bbc.co.uk/learningenglish/', description: 'Free English lessons from BBC' },
                { title: 'Duolingo English', type: 'documentation', url: 'https://www.duolingo.com/enroll/en/hi/Learn-English-Online', description: 'Free English learning app' }
            ],
            tags: ['english', 'language', 'communication', 'speaking']
        },
        {
            title: 'Climate Change & Our Environment',
            description: 'Understand the impact of climate change and what we can do to protect our beautiful Kashmir!',
            category: 'Environment', icon: '🌿', difficulty: 'beginner',
            pointsReward: 50, estimatedTime: '25 min',
            resources: [
                { title: 'Climate Change 101 - National Geographic', type: 'youtube', url: 'https://www.youtube.com/watch?v=EtW2rrLHs08', description: 'Introduction to climate change', duration: '10 min' },
                { title: 'NASA Climate Kids', type: 'blog', url: 'https://climatekids.nasa.gov/', description: 'NASA climate resources for students' }
            ],
            tags: ['environment', 'climate', 'nature', 'science']
        },
        {
            title: 'Mathematics Made Fun',
            description: 'Master fractions, percentages, and algebra with interactive problems!',
            category: 'Mathematics', icon: '🔢', difficulty: 'beginner',
            pointsReward: 70, estimatedTime: '40 min',
            resources: [
                { title: 'Khan Academy - Maths', type: 'documentation', url: 'https://www.khanacademy.org/math', description: 'Free world-class math education' },
                { title: 'Math Antics - Fractions', type: 'youtube', url: 'https://www.youtube.com/watch?v=n0FZhQ_GkKw', description: 'Easy fractions tutorial', duration: '9 min' }
            ],
            tags: ['maths', 'algebra', 'fractions', 'problem-solving']
        },
        {
            title: 'Digital Safety & Internet Basics',
            description: 'Stay safe online and learn the smart ways to use the internet and social media!',
            category: 'Life Skills', icon: '🔒', difficulty: 'beginner',
            pointsReward: 55, estimatedTime: '30 min',
            resources: [
                { title: 'Internet Safety for Kids - Google', type: 'documentation', url: 'https://beinternetawesome.withgoogle.com/', description: 'Google Be Internet Awesome program' },
                { title: 'Cyberbullying - What It Is & What To Do', type: 'youtube', url: 'https://www.youtube.com/watch?v=hch-mL1dO_k', description: 'Understanding online safety', duration: '6 min' }
            ],
            tags: ['internet', 'safety', 'digital literacy', 'online']
        }
    ]);

    // Create Questions for each topic
    const questions = [];

    // AI Topic Questions
    questions.push(
        {
            topic: topics[0]._id, question: 'What does AI stand for?', type: 'multiple_choice', points: 10,
            options: [{ text: 'Automatic Intelligence', isCorrect: false }, { text: 'Artificial Intelligence', isCorrect: true }, { text: 'Advanced Internet', isCorrect: false }, { text: 'Applied Information', isCorrect: false }],
            explanation: 'AI stands for Artificial Intelligence - creating machines that can think and learn like humans!'
        },
        {
            topic: topics[0]._id, question: 'A recommendation system that suggests YouTube videos you might like is an example of AI.', type: 'true_false', points: 10,
            options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
            explanation: 'Yes! YouTube uses AI algorithms to recommend videos based on your watching history.'
        },
        {
            topic: topics[0]._id, question: 'Which of these is an example of AI in everyday life?', type: 'multiple_choice', points: 10,
            options: [{ text: 'A regular calculator', isCorrect: false }, { text: 'A light switch', isCorrect: false }, { text: 'A voice assistant like Siri or Google', isCorrect: true }, { text: 'A paper book', isCorrect: false }],
            explanation: 'Voice assistants use AI to understand your voice and respond intelligently!'
        }
    );

    // Python Questions
    questions.push(
        {
            topic: topics[1]._id, question: 'Which symbol is used to print something in Python?', type: 'multiple_choice', points: 10,
            options: [{ text: 'console.log()', isCorrect: false }, { text: 'print()', isCorrect: true }, { text: 'echo()', isCorrect: false }, { text: 'write()', isCorrect: false }],
            explanation: 'In Python, we use print() to display output. Example: print("Hello World")'
        },
        {
            topic: topics[1]._id, question: 'Python was named after a type of snake.', type: 'true_false', points: 10,
            options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }],
            explanation: 'Actually, Python was named after the British comedy show "Monty Python\'s Flying Circus"!'
        },
        {
            topic: topics[1]._id, question: 'What will print("5" + "3") output in Python?', type: 'multiple_choice', points: 15,
            options: [{ text: '8', isCorrect: false }, { text: '53', isCorrect: true }, { text: 'Error', isCorrect: false }, { text: '5+3', isCorrect: false }],
            explanation: 'When you add two strings in Python, they get joined together (concatenated). "5" + "3" = "53"'
        }
    );

    // English Questions
    questions.push(
        {
            topic: topics[2]._id, question: 'Which is the correct greeting in English?', type: 'multiple_choice', points: 10,
            options: [{ text: 'Good morning, how are you?', isCorrect: true }, { text: 'Good morning, what are you?', isCorrect: false }, { text: 'Good day, where are you?', isCorrect: false }, { text: 'Fine morning, are you good?', isCorrect: false }],
            explanation: '"Good morning, how are you?" is the standard polite greeting in English!'
        },
        {
            topic: topics[2]._id, question: '"I go to school" is in past tense.', type: 'true_false', points: 10,
            options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: true }],
            explanation: '"I go to school" is present tense. Past tense would be "I went to school".'
        }
    );

    // Math Questions
    questions.push(
        {
            topic: topics[4]._id, question: 'What is 25% of 200?', type: 'multiple_choice', points: 15,
            options: [{ text: '25', isCorrect: false }, { text: '50', isCorrect: true }, { text: '75', isCorrect: false }, { text: '100', isCorrect: false }],
            explanation: '25% of 200 = (25/100) × 200 = 0.25 × 200 = 50'
        },
        {
            topic: topics[4]._id, question: 'If x + 5 = 12, what is the value of x?', type: 'multiple_choice', points: 10,
            options: [{ text: '5', isCorrect: false }, { text: '12', isCorrect: false }, { text: '7', isCorrect: true }, { text: '17', isCorrect: false }],
            explanation: 'x + 5 = 12, so x = 12 - 5 = 7'
        }
    );

    await Question.insertMany(questions);

    // Create Daily Tasks
    await Task.insertMany([
        { title: 'Morning Prayer & Meditation', description: 'Start your day with 10 minutes of prayer or quiet reflection', category: 'prayer', icon: '🤲', pointsReward: 15, dueTime: '06:00', isGlobal: true },
        { title: 'Read for 20 Minutes', description: 'Read any book, newspaper, or magazine', category: 'reading', icon: '📖', pointsReward: 25, dueTime: '09:00', isGlobal: true },
        { title: 'Complete One Learning Topic', description: 'Finish at least one topic in the Learning Hub', category: 'study', icon: '💻', pointsReward: 30, dueTime: '14:00', isGlobal: true },
        { title: 'Exercise or Outdoor Play', description: '30 minutes of physical activity, sports, or outdoor games', category: 'exercise', icon: '⚽', pointsReward: 20, dueTime: '17:00', isGlobal: true },
        { title: 'Help Clean the Common Area', description: 'Spend 10 minutes helping keep our home clean', category: 'chores', icon: '🧹', pointsReward: 15, dueTime: '16:00', isGlobal: true },
        { title: 'Write in Your Journal', description: 'Write 3 sentences about what you learned or felt today', category: 'study', icon: '✏️', pointsReward: 20, dueTime: '21:00', isGlobal: true },
    ]);

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Test Accounts:');
    console.log('─────────────────────────────────────────');
    console.log('👩‍💼 Admin:       admin@bwf.org       / admin123');
    console.log('👩‍🏫 Dean:        dean@bwf.org        / dean123');
    console.log('🏠 Housemother: housemother@bwf.org  / house123');
    console.log('👩‍🎓 Student 1:   aisha@bwf.org       / student123  (320pts, Grade 7)');
    console.log('👩‍🎓 Student 2:   sana@bwf.org        / student123  (180pts, Grade 6)');
    console.log('👩‍🎓 Student 3:   razia@bwf.org       / student123  (540pts, Grade 9) ⭐ TOP');
    console.log('👩‍🎓 Student 4:   noor@bwf.org        / student123  (90pts, Grade 5)');
    console.log('👩‍🎓 Student 5:   maryam@bwf.org      / student123  (410pts, Grade 8)');
    console.log('─────────────────────────────────────────');
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
