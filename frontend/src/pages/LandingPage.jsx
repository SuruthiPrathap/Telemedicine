import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const IMG = {
  hero:         '/images/hero.png',
  telemedHero:  '/images/telemed_hero.png',
  telemedRural: '/images/telemed_rural.png',
  ai:           '/images/ai.png',
  pharmacy:     '/images/pharmacy.png',
  records:      '/images/records.png',
 
};

// ── Translations
const TRANSLATIONS = {
  en: {
    nav: { brand: 'Telemedicine', signin: 'Sign In' },
    hero: {
      badge: 'Now Live Across India',
      title1: 'Expert Healthcare,',
      title2: 'Directly to Your Village',
      desc: 'Breaking geographic barriers to provide real-time consultations and reliable health tracking for rural communities.',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      doctors: '2,000+ Verified Doctors',
      secure: 'Secure & Private',
    },
    features: {
      sectionTitle: 'Complete Rural Healthcare System',
      sectionDesc: 'Everything you need for reliable healthcare access — from AI triage to live pharmacy stock.',
      ai: { title: 'AI Symptom Checker', desc: 'Describe your symptoms in plain language and get instant AI-powered preliminary assessments with confidence scores and doctor referrals.' },
      pharmacy: { title: 'Live Pharmacy Finder', desc: 'Find real-time medicine availability across nearby pharmacies with directions and contact details.' },
      records: { title: 'Health Records', desc: 'Securely store and access your complete medical history, prescriptions, and test results from anywhere.' },
      video: { title: 'Video Consultations', desc: 'Connect with verified doctors via low-bandwidth video calls optimised for rural 2G/3G networks.' },
      learnMore: 'Learn More',
    },
    modal: {
      howItWorks: 'HOW IT WORKS',
      gotIt: 'Got It →',
      ai: {
        title: 'AI Symptom Checker',
        steps: [
          { icon: '✏️', title: 'Describe Symptoms', desc: 'Type your symptoms in plain language — fever, cough, pain — in any supported language.' },
          { icon: '🤖', title: 'AI Analysis', desc: 'Our medical AI cross-references thousands of conditions and matches the closest diagnoses with confidence scores.' },
          { icon: '📋', title: 'Instant Report', desc: 'Receive a preliminary assessment with possible conditions, severity level, and next-step recommendations.' },
          { icon: '🏥', title: 'Doctor Referral', desc: 'If needed, instantly connect to a verified doctor for a full consultation — all within the same app.' },
        ],
        note: '⚠️ This is an AI advisory tool, not a medical diagnosis. Always consult a qualified doctor for treatment.',
      },
      pharmacy: {
        title: 'Live Pharmacy Finder',
        steps: [
          { icon: '📍', title: 'Share Location', desc: 'Allow location access or enter your pin code to find pharmacies within your area.' },
          { icon: '🔍', title: 'Search Medicine', desc: 'Type the medicine name. Our system queries real-time inventory across all registered pharmacies nearby.' },
          { icon: '🟢', title: 'Check Availability', desc: 'See live stock status — In Stock, Waiting for Delivery, or Out of Stock — for each pharmacy.' },
          { icon: '🗺️', title: 'Get Directions', desc: 'Tap on any pharmacy to get directions, contact number, and operating hours instantly.' },
        ],
        note: '💊 Inventory is updated every 30 minutes by registered pharmacy partners on our network.',
      },
      records: {
        title: 'Health Records',
        steps: [
          { icon: '🔐', title: 'Secure Upload', desc: 'Upload prescriptions, lab reports, and discharge summaries securely from your phone or tablet.' },
          { icon: '📁', title: 'Organised History', desc: 'All your records are automatically sorted by date and category for easy access.' },
          { icon: '🔗', title: 'Share with Doctor', desc: 'Share your medical history with any doctor instantly with a one-time access link.' },
          { icon: '🔔', title: 'Medication Reminders', desc: 'Set reminders for medicines and follow-up appointments directly from your health record.' },
        ],
        note: '🔒 Your data is encrypted and stored securely. Only you control who can access your records.',
      },
      video: {
        title: 'Video Consultations',
        steps: [
          { icon: '📶', title: 'Low-Bandwidth Ready', desc: 'Our video technology works on 2G and 3G connections — optimised for rural India.' },
          { icon: '🩺', title: 'Choose Your Doctor', desc: 'Browse verified doctors by speciality, language, and availability.' },
          { icon: '📹', title: 'Start Consultation', desc: 'Connect instantly or schedule an appointment. Audio-only fallback if video drops.' },
          { icon: '📄', title: 'Get Prescription', desc: 'Receive a digital prescription and follow-up notes directly after your consultation.' },
        ],
        note: '📡 Calls automatically switch to audio-only mode if bandwidth drops below threshold.',
      },
    },
    rural: {
      badge: 'Built for Bharat',
      title1: 'Healthcare That',
      title2: 'Travels to You',
      desc: 'Whether in a remote village or semi-urban town, our platform adapts to your connectivity, language, and local pharmacy network.',
      features: [
        'Works on 2G / low-bandwidth connections',
        'Available in 4 regional languages',
        'Integrated with local pharmacies',
        'Doctor responses within 15 minutes',
      ],
      cta: 'Start For Free',
      expertDoctors: 'Expert Doctors',
      availableNow: 'Available now',
    },
    stats: [
      { n: '2,000+', l: 'Verified Doctors' },
      { n: '50,000+', l: 'Active Patients' },
      { n: '98%', l: 'Coverage Rate' },
      { n: '24/7', l: 'Support Available' },
    ],
    cta: {
      title: 'Ready to Transform Rural Healthcare?',
      desc: 'Join thousands of rural patients and healthcare providers already transforming healthcare access across India.',
      join: 'Join the Network',
      demo: 'Schedule Demo',
    },
    footer: {
      tagline: 'Bridging the healthcare gap between urban and rural India through technology.',
      platform: 'Platform',
      login: 'Login',
      features: 'Features',
      network: 'Network',
      pricing: 'Pricing',
      company: 'Company',
      about: 'About Us',
      blog: 'Blog',
      careers: 'Careers',
      contact: 'Contact',
      support: 'Support',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      rights: 'All Rights Reserved.',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      copyright: '© 2024 TeleHealth Global Health.',
    },
  },
  hi: {
    nav: { brand: 'टेलीहेल्थ', signin: 'साइन इन' },
    hero: {
      badge: 'अब पूरे भारत में उपलब्ध',
      title1: 'विशेषज्ञ स्वास्थ्य सेवा,',
      title2: 'सीधे आपके गांव तक',
      desc: 'ग्रामीण समुदायों के लिए रीयल-टाइम परामर्श और विश्वसनीय स्वास्थ्य ट्रैकिंग प्रदान करने के लिए भौगोलिक बाधाओं को तोड़ना।',
      getStarted: 'शुरू करें',
      learnMore: 'अधिक जानें',
      doctors: '2,000+ सत्यापित डॉक्टर',
      secure: 'सुरक्षित और निजी',
    },
    features: {
      sectionTitle: 'संपूर्ण ग्रामीण स्वास्थ्य प्रणाली',
      sectionDesc: 'AI ट्राइज से लेकर लाइव फार्मेसी स्टॉक तक — विश्वसनीय स्वास्थ्य सेवा के लिए सब कुछ।',
      ai: { title: 'AI लक्षण जांचकर्ता', desc: 'अपने लक्षणों को सामान्य भाषा में बताएं और AI-संचालित प्रारंभिक मूल्यांकन तुरंत प्राप्त करें।' },
      pharmacy: { title: 'लाइव फार्मेसी खोजक', desc: 'नजदीकी फार्मेसियों में दवाओं की रीयल-टाइम उपलब्धता, दिशा-निर्देश और संपर्क विवरण के साथ खोजें।' },
      records: { title: 'स्वास्थ्य रिकॉर्ड', desc: 'अपनी पूर्ण चिकित्सा इतिहास, नुस्खे और परीक्षण परिणाम कहीं से भी सुरक्षित रूप से संग्रहीत करें।' },
      video: { title: 'वीडियो परामर्श', desc: 'कम बैंडविड्थ वाली 2G/3G नेटवर्क के लिए अनुकूलित वीडियो कॉल के माध्यम से सत्यापित डॉक्टरों से जुड़ें।' },
      learnMore: 'अधिक जानें',
    },
    modal: {
      howItWorks: 'यह कैसे काम करता है',
      gotIt: 'समझ गया →',
      ai: {
        title: 'AI लक्षण जांचकर्ता',
        steps: [
          { icon: '✏️', title: 'लक्षण बताएं', desc: 'अपने लक्षण सामान्य भाषा में टाइप करें — बुखार, खांसी, दर्द — किसी भी समर्थित भाषा में।' },
          { icon: '🤖', title: 'AI विश्लेषण', desc: 'हमारा मेडिकल AI हजारों स्थितियों का क्रॉस-रेफरेंस करता है और विश्वास स्कोर के साथ निदान मिलाता है।' },
          { icon: '📋', title: 'तत्काल रिपोर्ट', desc: 'संभावित स्थितियों, गंभीरता स्तर और अगले कदम की सिफारिशों के साथ प्रारंभिक मूल्यांकन प्राप्त करें।' },
          { icon: '🏥', title: 'डॉक्टर रेफरल', desc: 'यदि आवश्यक हो, तो उसी ऐप में सत्यापित डॉक्टर से तुरंत जुड़ें।' },
        ],
        note: '⚠️ यह एक AI परामर्श उपकरण है, चिकित्सा निदान नहीं। उपचार के लिए हमेशा योग्य डॉक्टर से परामर्श करें।',
      },
      pharmacy: {
        title: 'लाइव फार्मेसी खोजक',
        steps: [
          { icon: '📍', title: 'स्थान साझा करें', desc: 'अपने क्षेत्र में फार्मेसियां खोजने के लिए स्थान पहुंच की अनुमति दें या पिन कोड दर्ज करें।' },
          { icon: '🔍', title: 'दवा खोजें', desc: 'दवा का नाम टाइप करें। हमारा सिस्टम नजदीकी सभी पंजीकृत फार्मेसियों में रीयल-टाइम इन्वेंटरी क्वेरी करता है।' },
          { icon: '🟢', title: 'उपलब्धता जांचें', desc: 'प्रत्येक फार्मेसी के लिए लाइव स्टॉक स्थिति देखें — स्टॉक में, डिलीवरी की प्रतीक्षा, या स्टॉक से बाहर।' },
          { icon: '🗺️', title: 'दिशा-निर्देश प्राप्त करें', desc: 'किसी भी फार्मेसी पर टैप करें और तुरंत दिशा-निर्देश, संपर्क नंबर और कार्य समय प्राप्त करें।' },
        ],
        note: '💊 इन्वेंटरी हर 30 मिनट में हमारे नेटवर्क पर पंजीकृत फार्मेसी भागीदारों द्वारा अपडेट की जाती है।',
      },
      records: {
        title: 'स्वास्थ्य रिकॉर्ड',
        steps: [
          { icon: '🔐', title: 'सुरक्षित अपलोड', desc: 'अपने फोन या टैबलेट से नुस्खे, लैब रिपोर्ट और डिस्चार्ज सारांश सुरक्षित रूप से अपलोड करें।' },
          { icon: '📁', title: 'व्यवस्थित इतिहास', desc: 'आपके सभी रिकॉर्ड स्वचालित रूप से तिथि और श्रेणी के अनुसार छांटे जाते हैं।' },
          { icon: '🔗', title: 'डॉक्टर के साथ साझा करें', desc: 'एकबारगी एक्सेस लिंक के साथ किसी भी डॉक्टर को तुरंत अपनी चिकित्सा इतिहास साझा करें।' },
          { icon: '🔔', title: 'दवा अनुस्मारक', desc: 'अपने स्वास्थ्य रिकॉर्ड से सीधे दवाओं और फॉलो-अप अपॉइंटमेंट के लिए अनुस्मारक सेट करें।' },
        ],
        note: '🔒 आपका डेटा एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत है। केवल आप तय करते हैं कि आपके रिकॉर्ड तक किसकी पहुंच है।',
      },
      video: {
        title: 'वीडियो परामर्श',
        steps: [
          { icon: '📶', title: 'कम बैंडविड्थ तैयार', desc: 'हमारी वीडियो तकनीक 2G और 3G कनेक्शन पर काम करती है — ग्रामीण भारत के लिए अनुकूलित।' },
          { icon: '🩺', title: 'अपना डॉक्टर चुनें', desc: 'विशेषज्ञता, भाषा और उपलब्धता के अनुसार सत्यापित डॉक्टरों को ब्राउज़ करें।' },
          { icon: '📹', title: 'परामर्श शुरू करें', desc: 'तुरंत जुड़ें या अपॉइंटमेंट शेड्यूल करें। वीडियो बंद हो तो ऑडियो-ओनली फ़ॉलबैक उपलब्ध है।' },
          { icon: '📄', title: 'नुस्खा प्राप्त करें', desc: 'परामर्श के तुरंत बाद डिजिटल नुस्खा और फॉलो-अप नोट्स प्राप्त करें।' },
        ],
        note: '📡 बैंडविड्थ सीमा से नीचे जाने पर कॉल स्वचालित रूप से ऑडियो-ओनली मोड में बदल जाती है।',
      },
    },
    rural: {
      badge: 'भारत के लिए बनाया गया',
      title1: 'स्वास्थ्य सेवा जो',
      title2: 'आपके पास आती है',
      desc: 'चाहे दूरस्थ गांव हो या अर्ध-शहरी कस्बा, हमारा प्लेटफॉर्म आपकी कनेक्टिविटी, भाषा और स्थानीय फार्मेसी नेटवर्क के अनुकूल है।',
      features: [
        '2G / कम बैंडविड्थ कनेक्शन पर काम करता है',
        '4 क्षेत्रीय भाषाओं में उपलब्ध',
        'स्थानीय फार्मेसियों के साथ एकीकृत',
        '15 मिनट के भीतर डॉक्टर की प्रतिक्रिया',
      ],
      cta: 'मुफ्त में शुरू करें',
      expertDoctors: 'विशेषज्ञ डॉक्टर',
      availableNow: 'अभी उपलब्ध',
    },
    stats: [
      { n: '2,000+', l: 'सत्यापित डॉक्टर' },
      { n: '50,000+', l: 'सक्रिय मरीज' },
      { n: '98%', l: 'कवरेज दर' },
      { n: '24/7', l: 'सहायता उपलब्ध' },
    ],
    cta: {
      title: 'ग्रामीण स्वास्थ्य सेवा बदलने के लिए तैयार हैं?',
      desc: 'भारत भर में स्वास्थ्य सेवा पहुंच को पहले से बदल रहे हजारों ग्रामीण मरीजों और स्वास्थ्य सेवा प्रदाताओं से जुड़ें।',
      join: 'नेटवर्क से जुड़ें',
      demo: 'डेमो शेड्यूल करें',
    },
    footer: {
      tagline: 'प्रौद्योगिकी के माध्यम से शहरी और ग्रामीण भारत के बीच स्वास्थ्य सेवा की खाई को पाटना।',
      platform: 'प्लेटफॉर्म',
      login: 'लॉगिन',
      features: 'विशेषताएं',
      network: 'नेटवर्क',
      pricing: 'मूल्य निर्धारण',
      company: 'कंपनी',
      about: 'हमारे बारे में',
      blog: 'ब्लॉग',
      careers: 'करियर',
      contact: 'संपर्क',
      support: 'सहायता',
      privacy: 'गोपनीयता नीति',
      terms: 'नियम और शर्तें',
      rights: 'सर्वाधिकार सुरक्षित।',
      twitter: 'ट्विटर',
      linkedin: 'लिंक्डइन',
      instagram: 'इंस्टाग्राम',
      copyright: '© 2024 टेलीहेल्थ ग्लोबल हेल्थ।',
    },
  },
  pa: {
    nav: { brand: 'ਟੈਲੀਹੈਲਥ', signin: 'ਸਾਈਨ ਇਨ' },
    hero: {
      badge: 'ਹੁਣ ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਉਪਲਬਧ',
      title1: 'ਮਾਹਿਰ ਸਿਹਤ ਸੇਵਾ,',
      title2: 'ਸਿੱਧੇ ਤੁਹਾਡੇ ਪਿੰਡ ਤੱਕ',
      desc: 'ਪੇਂਡੂ ਭਾਈਚਾਰਿਆਂ ਲਈ ਰੀਅਲ-ਟਾਈਮ ਸਲਾਹ-ਮਸ਼ਵਰੇ ਅਤੇ ਭਰੋਸੇਯੋਗ ਸਿਹਤ ਟਰੈਕਿੰਗ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਭੂਗੋਲਿਕ ਰੁਕਾਵਟਾਂ ਤੋੜਨਾ।',
      getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
      learnMore: 'ਹੋਰ ਜਾਣੋ',
      doctors: '2,000+ ਪ੍ਰਮਾਣਿਤ ਡਾਕਟਰ',
      secure: 'ਸੁਰੱਖਿਅਤ ਅਤੇ ਨਿੱਜੀ',
    },
    features: {
      sectionTitle: 'ਸੰਪੂਰਨ ਪੇਂਡੂ ਸਿਹਤ ਪ੍ਰਣਾਲੀ',
      sectionDesc: 'AI ਟ੍ਰਾਈਜ ਤੋਂ ਲਾਈਵ ਫਾਰਮੇਸੀ ਸਟਾਕ ਤੱਕ — ਭਰੋਸੇਯੋਗ ਸਿਹਤ ਸੇਵਾ ਲਈ ਸਭ ਕੁਝ।',
      ai: { title: 'AI ਲੱਛਣ ਜਾਂਚਕਰਤਾ', desc: 'ਆਪਣੇ ਲੱਛਣਾਂ ਨੂੰ ਸਧਾਰਨ ਭਾਸ਼ਾ ਵਿੱਚ ਦੱਸੋ ਅਤੇ AI-ਸੰਚਾਲਿਤ ਮੁੱਢਲੇ ਮੁਲਾਂਕਣ ਤੁਰੰਤ ਪ੍ਰਾਪਤ ਕਰੋ।' },
      pharmacy: { title: 'ਲਾਈਵ ਫਾਰਮੇਸੀ ਖੋਜਕਰਤਾ', desc: 'ਨੇੜੇ ਦੀਆਂ ਫਾਰਮੇਸੀਆਂ ਵਿੱਚ ਦਵਾਈਆਂ ਦੀ ਰੀਅਲ-ਟਾਈਮ ਉਪਲਬਧਤਾ, ਦਿਸ਼ਾਵਾਂ ਅਤੇ ਸੰਪਰਕ ਵੇਰਵਿਆਂ ਨਾਲ ਖੋਜੋ।' },
      records: { title: 'ਸਿਹਤ ਰਿਕਾਰਡ', desc: 'ਆਪਣਾ ਪੂਰਾ ਡਾਕਟਰੀ ਇਤਿਹਾਸ, ਨੁਸਖ਼ੇ ਅਤੇ ਟੈਸਟ ਨਤੀਜੇ ਕਿਤੇ ਵੀ ਸੁਰੱਖਿਅਤ ਰੂਪ ਵਿੱਚ ਸਟੋਰ ਕਰੋ।' },
      video: { title: 'ਵੀਡੀਓ ਸਲਾਹ-ਮਸ਼ਵਰਾ', desc: 'ਪੇਂਡੂ 2G/3G ਨੈੱਟਵਰਕਾਂ ਲਈ ਅਨੁਕੂਲਿਤ ਘੱਟ-ਬੈਂਡਵਿਡਥ ਵੀਡੀਓ ਕਾਲਾਂ ਰਾਹੀਂ ਪ੍ਰਮਾਣਿਤ ਡਾਕਟਰਾਂ ਨਾਲ ਜੁੜੋ।' },
      learnMore: 'ਹੋਰ ਜਾਣੋ',
    },
    modal: {
      howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
      gotIt: 'ਸਮਝ ਗਿਆ →',
      ai: {
        title: 'AI ਲੱਛਣ ਜਾਂਚਕਰਤਾ',
        steps: [
          { icon: '✏️', title: 'ਲੱਛਣ ਦੱਸੋ', desc: 'ਆਪਣੇ ਲੱਛਣ ਸਧਾਰਨ ਭਾਸ਼ਾ ਵਿੱਚ ਟਾਈਪ ਕਰੋ — ਬੁਖ਼ਾਰ, ਖੰਘ, ਦਰਦ।' },
          { icon: '🤖', title: 'AI ਵਿਸ਼ਲੇਸ਼ਣ', desc: 'ਸਾਡਾ ਮੈਡੀਕਲ AI ਹਜ਼ਾਰਾਂ ਸਥਿਤੀਆਂ ਦਾ ਕ੍ਰਾਸ-ਰੈਫਰੈਂਸ ਕਰਦਾ ਹੈ।' },
          { icon: '📋', title: 'ਤੁਰੰਤ ਰਿਪੋਰਟ', desc: 'ਸੰਭਾਵਿਤ ਸਥਿਤੀਆਂ, ਗੰਭੀਰਤਾ ਅਤੇ ਅਗਲੇ ਕਦਮਾਂ ਦੀਆਂ ਸਿਫ਼ਾਰਿਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।' },
          { icon: '🏥', title: 'ਡਾਕਟਰ ਰੈਫਰਲ', desc: 'ਲੋੜ ਪੈਣ ਤੇ ਉਸੇ ਐਪ ਵਿੱਚ ਪ੍ਰਮਾਣਿਤ ਡਾਕਟਰ ਨਾਲ ਤੁਰੰਤ ਜੁੜੋ।' },
        ],
        note: '⚠️ ਇਹ ਇੱਕ AI ਸਲਾਹਕਾਰ ਸੰਦ ਹੈ, ਡਾਕਟਰੀ ਤਸ਼ਖ਼ੀਸ ਨਹੀਂ। ਇਲਾਜ ਲਈ ਹਮੇਸ਼ਾ ਯੋਗ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
      },
      pharmacy: {
        title: 'ਲਾਈਵ ਫਾਰਮੇਸੀ ਖੋਜਕਰਤਾ',
        steps: [
          { icon: '📍', title: 'ਸਥਾਨ ਸਾਂਝਾ ਕਰੋ', desc: 'ਆਪਣੇ ਖੇਤਰ ਵਿੱਚ ਫਾਰਮੇਸੀਆਂ ਲੱਭਣ ਲਈ ਸਥਾਨ ਪਹੁੰਚ ਦੀ ਆਗਿਆ ਦਿਓ ਜਾਂ ਪਿੰਨ ਕੋਡ ਦਰਜ ਕਰੋ।' },
          { icon: '🔍', title: 'ਦਵਾਈ ਖੋਜੋ', desc: 'ਦਵਾਈ ਦਾ ਨਾਮ ਟਾਈਪ ਕਰੋ। ਸਾਡਾ ਸਿਸਟਮ ਨੇੜੇ ਦੀਆਂ ਸਾਰੀਆਂ ਫਾਰਮੇਸੀਆਂ ਵਿੱਚ ਰੀਅਲ-ਟਾਈਮ ਸਟਾਕ ਜਾਂਚਦਾ ਹੈ।' },
          { icon: '🟢', title: 'ਉਪਲਬਧਤਾ ਜਾਂਚੋ', desc: 'ਲਾਈਵ ਸਟਾਕ ਸਥਿਤੀ ਦੇਖੋ — ਸਟਾਕ ਵਿੱਚ, ਡਿਲੀਵਰੀ ਦੀ ਉਡੀਕ, ਜਾਂ ਸਟਾਕ ਤੋਂ ਬਾਹਰ।' },
          { icon: '🗺️', title: 'ਦਿਸ਼ਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ', desc: 'ਕਿਸੇ ਵੀ ਫਾਰਮੇਸੀ ਤੇ ਟੈਪ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਦਿਸ਼ਾਵਾਂ, ਸੰਪਰਕ ਨੰਬਰ ਅਤੇ ਕੰਮ ਦੇ ਘੰਟੇ ਪ੍ਰਾਪਤ ਕਰੋ।' },
        ],
        note: '💊 ਸਟਾਕ ਹਰ 30 ਮਿੰਟ ਵਿੱਚ ਸਾਡੇ ਨੈੱਟਵਰਕ ਤੇ ਪੰਜੀਕ੍ਰਿਤ ਫਾਰਮੇਸੀ ਭਾਈਵਾਲਾਂ ਦੁਆਰਾ ਅੱਪਡੇਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।',
      },
      records: {
        title: 'ਸਿਹਤ ਰਿਕਾਰਡ',
        steps: [
          { icon: '🔐', title: 'ਸੁਰੱਖਿਅਤ ਅੱਪਲੋਡ', desc: 'ਆਪਣੇ ਫੋਨ ਤੋਂ ਨੁਸਖ਼ੇ, ਲੈਬ ਰਿਪੋਰਟਾਂ ਅਤੇ ਡਿਸਚਾਰਜ ਸੰਖੇਪ ਸੁਰੱਖਿਅਤ ਰੂਪ ਵਿੱਚ ਅੱਪਲੋਡ ਕਰੋ।' },
          { icon: '📁', title: 'ਵਿਵਸਥਿਤ ਇਤਿਹਾਸ', desc: 'ਤੁਹਾਡੇ ਸਾਰੇ ਰਿਕਾਰਡ ਆਪਣੇ ਆਪ ਤਾਰੀਖ਼ ਅਤੇ ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਛਾਂਟੇ ਜਾਂਦੇ ਹਨ।' },
          { icon: '🔗', title: 'ਡਾਕਟਰ ਨਾਲ ਸਾਂਝਾ ਕਰੋ', desc: 'ਇੱਕ-ਵਾਰ ਦੇ ਐਕਸੈਸ ਲਿੰਕ ਨਾਲ ਕਿਸੇ ਵੀ ਡਾਕਟਰ ਨੂੰ ਤੁਰੰਤ ਆਪਣਾ ਇਤਿਹਾਸ ਸਾਂਝਾ ਕਰੋ।' },
          { icon: '🔔', title: 'ਦਵਾਈ ਰੀਮਾਈਂਡਰ', desc: 'ਆਪਣੇ ਸਿਹਤ ਰਿਕਾਰਡ ਤੋਂ ਸਿੱਧੇ ਦਵਾਈਆਂ ਅਤੇ ਅਪੌਇੰਟਮੈਂਟਾਂ ਲਈ ਰੀਮਾਈਂਡਰ ਸੈੱਟ ਕਰੋ।' },
        ],
        note: '🔒 ਤੁਹਾਡਾ ਡੇਟਾ ਏਨਕ੍ਰਿਪਟਡ ਅਤੇ ਸੁਰੱਖਿਅਤ ਰੂਪ ਵਿੱਚ ਸਟੋਰ ਕੀਤਾ ਗਿਆ ਹੈ।',
      },
      video: {
        title: 'ਵੀਡੀਓ ਸਲਾਹ-ਮਸ਼ਵਰਾ',
        steps: [
          { icon: '📶', title: 'ਘੱਟ ਬੈਂਡਵਿਡਥ ਤਿਆਰ', desc: 'ਸਾਡੀ ਵੀਡੀਓ ਤਕਨੀਕ 2G ਅਤੇ 3G ਕਨੈਕਸ਼ਨਾਂ ਤੇ ਕੰਮ ਕਰਦੀ ਹੈ।' },
          { icon: '🩺', title: 'ਆਪਣਾ ਡਾਕਟਰ ਚੁਣੋ', desc: 'ਵਿਸ਼ੇਸ਼ਤਾ, ਭਾਸ਼ਾ ਅਤੇ ਉਪਲਬਧਤਾ ਅਨੁਸਾਰ ਪ੍ਰਮਾਣਿਤ ਡਾਕਟਰਾਂ ਨੂੰ ਬ੍ਰਾਊਜ਼ ਕਰੋ।' },
          { icon: '📹', title: 'ਸਲਾਹ ਸ਼ੁਰੂ ਕਰੋ', desc: 'ਤੁਰੰਤ ਜੁੜੋ ਜਾਂ ਅਪੌਇੰਟਮੈਂਟ ਨਿਰਧਾਰਿਤ ਕਰੋ। ਵੀਡੀਓ ਬੰਦ ਹੋਣ ਤੇ ਆਡੀਓ-ਓਨਲੀ ਫਾਲਬੈਕ ਉਪਲਬਧ ਹੈ।' },
          { icon: '📄', title: 'ਨੁਸਖ਼ਾ ਪ੍ਰਾਪਤ ਕਰੋ', desc: 'ਸਲਾਹ ਤੋਂ ਤੁਰੰਤ ਬਾਅਦ ਡਿਜੀਟਲ ਨੁਸਖ਼ਾ ਅਤੇ ਫਾਲੋ-ਅੱਪ ਨੋਟਸ ਪ੍ਰਾਪਤ ਕਰੋ।' },
        ],
        note: '📡 ਬੈਂਡਵਿਡਥ ਘੱਟ ਜਾਣ ਤੇ ਕਾਲ ਆਟੋਮੈਟਿਕ ਆਡੀਓ-ਓਨਲੀ ਮੋਡ ਵਿੱਚ ਬਦਲ ਜਾਂਦੀ ਹੈ।',
      },
    },
    rural: {
      badge: 'ਭਾਰਤ ਲਈ ਬਣਾਇਆ',
      title1: 'ਸਿਹਤ ਸੇਵਾ ਜੋ',
      title2: 'ਤੁਹਾਡੇ ਕੋਲ ਆਉਂਦੀ ਹੈ',
      desc: 'ਚਾਹੇ ਦੂਰ-ਦੁਰਾਡੇ ਪਿੰਡ ਹੋਵੇ ਜਾਂ ਅਰਧ-ਸ਼ਹਿਰੀ ਕਸਬਾ, ਸਾਡਾ ਪਲੇਟਫਾਰਮ ਤੁਹਾਡੀ ਕਨੈਕਟੀਵਿਟੀ, ਭਾਸ਼ਾ ਅਤੇ ਫਾਰਮੇਸੀ ਨੈੱਟਵਰਕ ਅਨੁਸਾਰ ਢਲਦਾ ਹੈ।',
      features: [
        '2G / ਘੱਟ-ਬੈਂਡਵਿਡਥ ਕਨੈਕਸ਼ਨਾਂ ਤੇ ਕੰਮ ਕਰਦਾ ਹੈ',
        '4 ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ',
        'ਸਥਾਨਕ ਫਾਰਮੇਸੀਆਂ ਨਾਲ ਜੁੜਿਆ',
        '15 ਮਿੰਟਾਂ ਵਿੱਚ ਡਾਕਟਰ ਦਾ ਜਵਾਬ',
      ],
      cta: 'ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ',
      expertDoctors: 'ਮਾਹਿਰ ਡਾਕਟਰ',
      availableNow: 'ਹੁਣ ਉਪਲਬਧ',
    },
    stats: [
      { n: '2,000+', l: 'ਪ੍ਰਮਾਣਿਤ ਡਾਕਟਰ' },
      { n: '50,000+', l: 'ਕਿਰਿਆਸ਼ੀਲ ਮਰੀਜ਼' },
      { n: '98%', l: 'ਕਵਰੇਜ ਦਰ' },
      { n: '24/7', l: 'ਸਹਾਇਤਾ ਉਪਲਬਧ' },
    ],
    cta: {
      title: 'ਪੇਂਡੂ ਸਿਹਤ ਸੇਵਾ ਬਦਲਣ ਲਈ ਤਿਆਰ ਹੋ?',
      desc: 'ਭਾਰਤ ਭਰ ਵਿੱਚ ਸਿਹਤ ਸੇਵਾ ਪਹੁੰਚ ਬਦਲ ਰਹੇ ਹਜ਼ਾਰਾਂ ਪੇਂਡੂ ਮਰੀਜ਼ਾਂ ਅਤੇ ਪ੍ਰਦਾਤਾਵਾਂ ਨਾਲ ਜੁੜੋ।',
      join: 'ਨੈੱਟਵਰਕ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
      demo: 'ਡੈਮੋ ਬੁੱਕ ਕਰੋ',
    },
    footer: {
      tagline: 'ਤਕਨੀਕ ਰਾਹੀਂ ਸ਼ਹਿਰੀ ਅਤੇ ਪੇਂਡੂ ਭਾਰਤ ਵਿਚਕਾਰ ਸਿਹਤ ਸੇਵਾ ਦੀ ਖਾਈ ਨੂੰ ਭਰਨਾ।',
      platform: 'ਪਲੇਟਫਾਰਮ',
      login: 'ਲੌਗਇਨ',
      features: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
      network: 'ਨੈੱਟਵਰਕ',
      pricing: 'ਕੀਮਤ',
      company: 'ਕੰਪਨੀ',
      about: 'ਸਾਡੇ ਬਾਰੇ',
      blog: 'ਬਲੌਗ',
      careers: 'ਕਰੀਅਰ',
      contact: 'ਸੰਪਰਕ',
      support: 'ਸਹਾਇਤਾ',
      privacy: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
      terms: 'ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
      rights: 'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
      twitter: 'ਟਵਿੱਟਰ',
      linkedin: 'ਲਿੰਕਡਇਨ',
      instagram: 'ਇੰਸਟਾਗ੍ਰਾਮ',
      copyright: '© 2024 ਟੈਲੀਹੈਲਥ ਗਲੋਬਲ ਹੈਲਥ।',
    },
  },
  ta: {
    nav: { brand: 'டெலிஹெல்த்', signin: 'உள்நுழைக' },
    hero: {
      badge: 'இப்போது இந்தியா முழுவதும்',
      title1: 'நிபுணத்துவ மருத்துவ சிகிச்சை,',
      title2: 'நேரடியாக உங்கள் கிராமத்திற்கு',
      desc: 'கிராமப்புற சமூகங்களுக்கு நிகழ்நேர ஆலோசனைகள் மற்றும் நம்பகமான சுகாதார கண்காணிப்பை வழங்க புவியியல் தடைகளை உடைக்கிறோம்.',
      getStarted: 'தொடங்குங்கள்',
      learnMore: 'மேலும் அறிக',
      doctors: '2,000+ சரிபார்க்கப்பட்ட மருத்துவர்கள்',
      secure: 'பாதுகாப்பான மற்றும் தனியார்',
    },
    features: {
      sectionTitle: 'முழுமையான கிராமப்புற சுகாதார அமைப்பு',
      sectionDesc: 'AI டிரியாஜ் முதல் நேரடி மருந்தக இருப்பு வரை — நம்பகமான சுகாதார அணுகலுக்கு அனைத்தும்.',
      ai: { title: 'AI அறிகுறி சரிபார்ப்பு', desc: 'உங்கள் அறிகுறிகளை எளிய மொழியில் விவரிக்கவும், AI-இயக்கப்பட்ட முன்னோட்ட மதிப்பீடுகளை உடனடியாக பெறவும்.' },
      pharmacy: { title: 'நேரடி மருந்தக தேடல்', desc: 'அருகில் உள்ள மருந்தகங்களில் மருந்துகளின் நிகழ்நேர கிடைக்கும் தன்மையை வழிகாட்டல் மற்றும் தொடர்பு விவரங்களுடன் கண்டறியவும்.' },
      records: { title: 'சுகாதார பதிவுகள்', desc: 'உங்கள் முழுமையான மருத்துவ வரலாறு, மருந்து சீட்டுகள் மற்றும் சோதனை முடிவுகளை எங்கிருந்தும் பாதுகாப்பாக சேமிக்கவும்.' },
      video: { title: 'வீடியோ ஆலோசனைகள்', desc: 'கிராமப்புற 2G/3G நெட்வொர்க்குகளுக்கு மேம்படுத்தப்பட்ட குறைந்த-அலைவரிசை வீடியோ அழைப்புகள் மூலம் சரிபார்க்கப்பட்ட மருத்துவர்களுடன் இணையுங்கள்.' },
      learnMore: 'மேலும் அறிக',
    },
    modal: {
      howItWorks: 'எப்படி செயல்படுகிறது',
      gotIt: 'புரிந்தது →',
      ai: {
        title: 'AI அறிகுறி சரிபார்ப்பு',
        steps: [
          { icon: '✏️', title: 'அறிகுறிகளை விவரிக்கவும்', desc: 'காய்ச்சல், இருமல், வலி போன்ற உங்கள் அறிகுறிகளை எளிய மொழியில் தட்டச்சு செய்யுங்கள்.' },
          { icon: '🤖', title: 'AI பகுப்பாய்வு', desc: 'எங்கள் மருத்துவ AI ஆயிரக்கணக்கான நிலைமைகளை சரிபார்த்து, நம்பிக்கை மதிப்பெண்களுடன் நோயறிதல்களை பொருத்துகிறது.' },
          { icon: '📋', title: 'உடனடி அறிக்கை', desc: 'சாத்தியமான நிலைமைகள், தீவிரம் மற்றும் அடுத்த படி பரிந்துரைகளுடன் முன்னோட்ட மதிப்பீட்டை பெறுங்கள்.' },
          { icon: '🏥', title: 'மருத்துவர் பரிந்துரை', desc: 'தேவைப்பட்டால், அதே பயன்பாட்டில் சரிபார்க்கப்பட்ட மருத்துவருடன் உடனடியாக இணையுங்கள்.' },
        ],
        note: '⚠️ இது ஒரு AI ஆலோசனை கருவி, மருத்துவ நோயறிதல் அல்ல. சிகிச்சைக்கு எப்போதும் தகுதிவாய்ந்த மருத்துவரிடம் ஆலோசிக்கவும்.',
      },
      pharmacy: {
        title: 'நேரடி மருந்தக தேடல்',
        steps: [
          { icon: '📍', title: 'இருப்பிடம் பகிரவும்', desc: 'உங்கள் பகுதியில் மருந்தகங்களை கண்டறிய இருப்பிட அணுகலை அனுமதிக்கவும் அல்லது பின் குறியீட்டை உள்ளிடவும்.' },
          { icon: '🔍', title: 'மருந்தை தேடுங்கள்', desc: 'மருந்தின் பெயரை தட்டச்சு செய்யுங்கள். எங்கள் அமைப்பு அருகில் உள்ள அனைத்து மருந்தகங்களிலும் நிகழ்நேர இருப்பை வினவுகிறது.' },
          { icon: '🟢', title: 'கிடைக்கும் தன்மையை சரிபார்க்கவும்', desc: 'ஒவ்வொரு மருந்தகத்திற்கும் நேரடி பங்கு நிலையை பாருங்கள் — இருப்பில் உள்ளது, விநியோகத்திற்காக காத்திருக்கிறது, அல்லது பங்கு இல்லை.' },
          { icon: '🗺️', title: 'வழிகாட்டல் பெறுங்கள்', desc: 'எந்த மருந்தகத்திலும் தட்டவும், வழிகாட்டல், தொடர்பு எண் மற்றும் இயக்க நேரங்களை உடனடியாக பெறுங்கள்.' },
        ],
        note: '💊 இருப்பு ஒவ்வொரு 30 நிமிடங்களுக்கும் எங்கள் நெட்வொர்க்கில் உள்ள பதிவுசெய்யப்பட்ட மருந்தக கூட்டாளிகளால் புதுப்பிக்கப்படுகிறது.',
      },
      records: {
        title: 'சுகாதார பதிவுகள்',
        steps: [
          { icon: '🔐', title: 'பாதுகாப்பான பதிவேற்றம்', desc: 'உங்கள் தொலைபேசி அல்லது டேப்லெட்டிலிருந்து மருந்து சீட்டுகள், ஆய்வக அறிக்கைகளை பாதுகாப்பாக பதிவேற்றுங்கள்.' },
          { icon: '📁', title: 'ஒழுங்கமைக்கப்பட்ட வரலாறு', desc: 'உங்கள் அனைத்து பதிவுகளும் தேதி மற்றும் வகையின்படி தானாகவே வரிசைப்படுத்தப்படுகின்றன.' },
          { icon: '🔗', title: 'மருத்துவருடன் பகிரவும்', desc: 'ஒரு முறை அணுகல் இணைப்புடன் எந்த மருத்துவருக்கும் உடனடியாக உங்கள் மருத்துவ வரலாற்றை பகிரவும்.' },
          { icon: '🔔', title: 'மருந்து நினைவூட்டல்கள்', desc: 'உங்கள் சுகாதார பதிவிலிருந்து நேரடியாக மருந்துகள் மற்றும் அடுத்த சந்திப்புக்கான நினைவூட்டல்களை அமைக்கவும்.' },
        ],
        note: '🔒 உங்கள் தரவு மறைகுறியாக்கப்பட்டு பாதுகாப்பாக சேமிக்கப்படுகிறது. உங்கள் பதிவுகளை யார் அணுகலாம் என்பதை நீங்கள் மட்டுமே கட்டுப்படுத்துகிறீர்கள்.',
      },
      video: {
        title: 'வீடியோ ஆலோசனைகள்',
        steps: [
          { icon: '📶', title: 'குறைந்த அலைவரிசை தயார்', desc: 'எங்கள் வீடியோ தொழில்நுட்பம் 2G மற்றும் 3G இணைப்புகளில் செயல்படுகிறது — கிராமப்புற இந்தியாவிற்காக மேம்படுத்தப்பட்டது.' },
          { icon: '🩺', title: 'உங்கள் மருத்துவரை தேர்வு செய்யுங்கள்', desc: 'நிபுணத்துவம், மொழி மற்றும் கிடைக்கும் தன்மையின்படி சரிபார்க்கப்பட்ட மருத்துவர்களை உலாவுங்கள்.' },
          { icon: '📹', title: 'ஆலோசனையை தொடங்கவும்', desc: 'உடனடியாக இணையுங்கள் அல்லது சந்திப்பை திட்டமிடுங்கள். வீடியோ தடைபட்டால் ஆடியோ மட்டும் பயன்முறை உள்ளது.' },
          { icon: '📄', title: 'மருந்து சீட்டு பெறுங்கள்', desc: 'ஆலோசனைக்கு பிறகு நேரடியாக டிஜிட்டல் மருந்து சீட்டு மற்றும் தொடர்பு குறிப்புகளை பெறுங்கள்.' },
        ],
        note: '📡 அலைவரிசை வரம்பிற்கு கீழே குறைந்தால் அழைப்புகள் தானாகவே ஆடியோ மட்டும் பயன்முறைக்கு மாறும்.',
      },
    },
    rural: {
      badge: 'பாரதத்திற்காக கட்டமைக்கப்பட்டது',
      title1: 'சுகாதார சேவை',
      title2: 'உங்களிடம் வருகிறது',
      desc: 'தொலைதூர கிராமமாக இருந்தாலும் அல்லது அரை நகர்ப்புற நகரமாக இருந்தாலும், எங்கள் தளம் உங்கள் இணைப்பு, மொழி மற்றும் உள்ளூர் மருந்தக நெட்வொர்க்கிற்கு ஏற்படுகிறது.',
      features: [
        '2G / குறைந்த அலைவரிசை இணைப்புகளில் செயல்படுகிறது',
        '4 பிராந்திய மொழிகளில் கிடைக்கிறது',
        'உள்ளூர் மருந்தகங்களுடன் ஒருங்கிணைக்கப்பட்டுள்ளது',
        '15 நிமிடங்களுக்குள் மருத்துவர் பதில்',
      ],
      cta: 'இலவசமாக தொடங்குங்கள்',
      expertDoctors: 'நிபுண மருத்துவர்கள்',
      availableNow: 'இப்போது கிடைக்கிறது',
    },
    stats: [
      { n: '2,000+', l: 'சரிபார்க்கப்பட்ட மருத்துவர்கள்' },
      { n: '50,000+', l: 'செயலில் உள்ள நோயாளிகள்' },
      { n: '98%', l: 'கவரேஜ் விகிதம்' },
      { n: '24/7', l: 'ஆதரவு கிடைக்கிறது' },
    ],
    cta: {
      title: 'கிராமப்புற சுகாதாரத்தை மாற்ற தயாரா?',
      desc: 'இந்தியா முழுவதும் சுகாதார அணுகலை ஏற்கனவே மாற்றி வரும் ஆயிரக்கணக்கான கிராமப்புற நோயாளிகள் மற்றும் வழங்குநர்களுடன் சேருங்கள்.',
      join: 'நெட்வொர்க்கில் சேருங்கள்',
      demo: 'டெமோ திட்டமிடுங்கள்',
    },
    footer: {
      tagline: 'தொழில்நுட்பம் மூலம் நகர்ப்புற மற்றும் கிராமப்புற இந்தியாவிற்கிடையேயான சுகாதார இடைவெளியை இணைக்கிறோம்.',
      platform: 'தளம்',
      login: 'உள்நுழைவு',
      features: 'அம்சங்கள்',
      network: 'நெட்வொர்க்',
      pricing: 'விலை நிர்ணயம்',
      company: 'நிறுவனம்',
      about: 'எங்களை பற்றி',
      blog: 'வலைப்பதிவு',
      careers: 'வாழ்க்கை வாய்ப்புகள்',
      contact: 'தொடர்பு',
      support: 'ஆதரவு',
      privacy: 'தனியுரிமை கொள்கை',
      terms: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      twitter: 'ட்விட்டர்',
      linkedin: 'லிங்க்டின்',
      instagram: 'இன்ஸ்டாகிராம்',
      copyright: '© 2024 டெலிஹெல்த் குளோபல் ஹெல்த்.',
    },
  },
};

// ── Modal component
const FeatureModal = ({ modalData, langData, onClose }) => {
  if (!modalData) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg,#0d1526 0%,#0a1020 100%)',
          border: '1px solid rgba(34,211,238,0.22)',
          borderRadius: 20, padding: '36px', maxWidth: 560, width: '100%',
          position: 'relative',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.26s cubic-bezier(0.34,1.56,0.64,1) both',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Sora, system-ui, sans-serif',
        }}>✕</button>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 12px', borderRadius: 100, marginBottom: 18,
          border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.07)',
          fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>{langData.modal.howItWorks}</div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginBottom: 28, letterSpacing: '-0.02em', paddingRight: 40 }}>
          {modalData.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
          {modalData.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{step.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
                  <span style={{ color: '#22d3ee', marginRight: 8 }}>{i + 1}.</span>{step.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: 11, color: '#475569', lineHeight: 1.7,
        }}>{modalData.note}</div>

        <button onClick={onClose} style={{
          marginTop: 24, width: '100%', padding: '12px', borderRadius: 10,
          border: 'none', cursor: 'pointer',
          background: 'linear-gradient(90deg,#2563eb,#06b6d4)',
          color: '#fff', fontWeight: 800, fontSize: 14,
          fontFamily: 'Sora, system-ui, sans-serif',
        }}>{langData.modal.gotIt}</button>
      </div>
    </div>
  );
};

const TelemedLogo = ({ size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.24,
    background: 'linear-gradient(135deg,#0ea5e9,#06b6d4,#22d3ee)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(6,182,212,0.4)', flexShrink: 0,
  }}>
    <svg width={size * 0.60} height={size * 0.60} viewBox="0 0 22 22" fill="none">
      <rect x="8.5" y="2" width="5" height="18" rx="2.2" fill="white"/>
      <rect x="2" y="8.5" width="18" height="5" rx="2.2" fill="white"/>
    </svg>
  </div>
);

const TelemedLandingPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const langCode = (i18n.language || 'en').slice(0, 2);
  const T = TRANSLATIONS[langCode] || TRANSLATIONS.en;

  useEffect(() => {
    setIsVisible(true);
    document.title = 'Telemedicine | Premium Rural Healthcare';
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const features = [
    { key: 'ai',       icon: '🧠', image: IMG.ai,           badge: 'Recommendation: Continued Monitoring', title: T.features.ai.title,       desc: T.features.ai.desc,       hasModal: true },
    { key: 'pharmacy', icon: '💊', image: IMG.pharmacy,      badge: null,                                  title: T.features.pharmacy.title,  desc: T.features.pharmacy.desc,  hasModal: true },
    { key: 'records',  icon: '🏥', image: IMG.records,       badge: null,                                  title: T.features.records.title,   desc: T.features.records.desc,   hasModal: true },
    { key: 'video',    icon: '📹', image: IMG.telemedRural,  badge: null,                                  title: T.features.video.title,     desc: T.features.video.desc,     hasModal: true },
  ];

  const getModalData = (key) => {
    if (!key) return null;
    return T.modal[key] || null;
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; width: 100%; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .tlm-wrap * { font-family: 'Sora', system-ui, sans-serif; }
        .anim1 { animation: fadeUp 0.85s ease both; }
        .anim2 { animation: fadeUp 0.85s 0.15s ease both; }
        .anim3 { animation: fadeUp 0.85s 0.30s ease both; }

        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #090d18; }
        ::-webkit-scrollbar-thumb { background: #2563eb66; border-radius: 3px; }

        .feat-card {
          border-radius: 16px; overflow: hidden;
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .feat-card:hover {
          border-color: rgba(34,211,238,0.35);
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(34,211,238,0.08);
        }
        .feat-card .feat-img { transition: transform 0.4s; }
        .feat-card:hover .feat-img { transform: scale(1.07); }

        .learn-more-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; color: #22d3ee;
          background: none; border: none; cursor: pointer; padding: 0;
          font-family: 'Sora', system-ui, sans-serif;
          transition: gap 0.15s, color 0.15s;
        }
        .learn-more-btn:hover { color: #67e8f9; gap: 8px; }

        .btn-primary { transition: transform 0.15s; cursor: pointer; border: none; }
        .btn-primary:hover { transform: scale(1.04); }
        .btn-ghost { transition: background 0.15s; cursor: pointer; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1) !important; }
        .footer-a { transition: color 0.15s; text-decoration: none; }
        .footer-a:hover { color: #60a5fa !important; }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .feat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .stats-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .rural-grid  { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-img-col { height: 55vw !important; min-height: 260px !important; }
          .hero-left { padding: 60px 24px 32px !important; }
        }
        @media (max-width: 600px) {
          .feat-grid   { grid-template-columns: 1fr !important; }
          .stats-grid  { grid-template-columns: 1fr 1fr !important; }
          .section-pad { padding: 48px 16px !important; }
          .hero-left   { padding: 60px 16px 28px !important; }
          .hero-btns   { flex-direction: column !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .cta-btns    { flex-direction: column !important; align-items: stretch !important; }
          .rural-img   { height: 240px !important; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {activeModal && (
        <FeatureModal
          modalData={getModalData(activeModal)}
          langData={T}
          onClose={() => setActiveModal(null)}
        />
      )}

      <div className="tlm-wrap" style={{
        width: '100%', minHeight: '100vh', overflowX: 'hidden',
        background: 'linear-gradient(160deg,#090d18 0%,#0c1225 50%,#090d18 100%)',
        color: '#e2e8f0',
      }}>

        {/* NAVBAR */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          background: 'rgba(9,13,24,0.78)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(59,130,246,0.12)',
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <TelemedLogo size={34} />
            <span style={{
              fontWeight: 800, fontSize: 16,
              background: 'linear-gradient(90deg,#60a5fa,#22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{T.nav.brand}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={langCode}
              onChange={e => changeLanguage(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#94a3b8', cursor: 'pointer', appearance: 'none',
              }}
            >
              <option value="en">🌐 EN</option>
              <option value="hi">🌐 HI</option>
              <option value="pa">🌐 PA</option>
              <option value="ta">🌐 TA</option>
            </select>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{
                padding: '8px 18px', borderRadius: 8,
                background: 'linear-gradient(90deg,#3b82f6,#06b6d4)',
                color: '#fff', fontWeight: 800, fontSize: 13,
              }}
            >{T.nav.signin}</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh', paddingTop: 60, width: '100%', overflow: 'hidden',
        }}>
          <div className="hero-left" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '64px 48px',
          }}>
            <div className={isVisible ? 'anim1' : ''} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 100, marginBottom: 28, width: 'fit-content',
              border: '1px solid rgba(34,211,238,0.35)', background: 'rgba(34,211,238,0.08)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', display: 'block', animation: 'float 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {T.hero.badge}
              </span>
            </div>

            <h1 className={isVisible ? 'anim2' : ''} style={{
              fontSize: 'clamp(24px,3.6vw,54px)', fontWeight: 900, lineHeight: 1.12,
              marginBottom: 18, letterSpacing: '-0.02em',
            }}>
              <span style={{ color: '#f1f5f9', display: 'block' }}>{T.hero.title1}</span>
              <span style={{
                background: 'linear-gradient(90deg,#3b82f6,#22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block',
              }}>{T.hero.title2}</span>
            </h1>

            <p className={isVisible ? 'anim3' : ''} style={{
              fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 36, maxWidth: 420,
            }}>{T.hero.desc}</p>

            <div className="hero-btns" style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{
                padding: '13px 28px', borderRadius: 10,
                background: 'linear-gradient(90deg,#2563eb,#06b6d4)',
                color: '#fff', fontWeight: 800, fontSize: 14,
                boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
              }}>{T.hero.getStarted} →</button>
              <button className="btn-ghost" style={{
                padding: '13px 28px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.04)',
                color: '#cbd5e1', fontWeight: 700, fontSize: 14,
              }}>{T.hero.learnMore}</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '2px solid #090d18', marginLeft: i === 0 ? 0 : -10,
                    background: `linear-gradient(135deg,hsl(${200+i*15},75%,55%),hsl(${185+i*12},65%,42%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                  }}>{i+1}</div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#e2e8f0' }}>{T.hero.doctors}</span> &amp; {T.hero.secure}
              </span>
            </div>
          </div>

          <div className="hero-img-col" style={{ position: 'relative', overflow: 'hidden', minHeight: 400 }}>
            <img src={IMG.telemedHero} alt="Telemedicine consultation" style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#090d18 0%,transparent 22%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: 'linear-gradient(to top,#090d18,transparent)', pointerEvents: 'none' }} />

            <div style={{
              position: 'absolute', bottom: 36, left: 36,
              background: 'rgba(9,13,24,0.9)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(34,211,238,0.25)', borderRadius: 14,
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
              animation: 'float 4s ease-in-out infinite',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TelemedLogo size={28} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>98%</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Coverage</div>
              </div>
            </div>

            <div style={{
              position: 'absolute', top: 36, right: 36,
              background: 'rgba(9,13,24,0.88)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(59,130,246,0.22)', borderRadius: 14,
              padding: '12px 18px', animation: 'float 5s ease-in-out infinite reverse',
            }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Doctors</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#60a5fa' }}>2,000+</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section-pad" style={{ padding: '80px 24px', width: '100%' }}>
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px,2.8vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10 }}>
              {T.features.sectionTitle}
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, lineHeight: 1.75 }}>
              {T.features.sectionDesc}
            </p>
          </div>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, width: '100%' }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="feat-card"
                onClick={() => setActiveModal(f.key)}
              >
                <div style={{ position: 'relative', width: '100%', height: 215, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={f.image} alt={f.title} className="feat-img" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%', background: 'linear-gradient(to top,#0d1526,transparent)', pointerEvents: 'none' }} />
                  {f.badge && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10, right: 10,
                      background: 'rgba(9,13,24,0.86)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(34,211,238,0.28)', borderRadius: 7,
                      padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#22d3ee',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{f.badge}</div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(9,13,24,0.82)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                  }}>{f.icon}</div>
                </div>

                <div style={{ padding: '18px 18px 22px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.72, flexGrow: 1 }}>{f.desc}</p>
                  <div style={{ marginTop: 14 }}>
                    <button
                      className="learn-more-btn"
                      onClick={e => { e.stopPropagation(); setActiveModal(f.key); }}
                    >
                      {T.features.learnMore}
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="section-pad" style={{ padding: '0 24px 80px' }}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {T.stats.map((s, i) => (
              <div key={i} style={{
                padding: '28px 20px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  fontSize: 32, fontWeight: 900, marginBottom: 6,
                  background: 'linear-gradient(90deg,#60a5fa,#22d3ee)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{s.n}</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RURAL SHOWCASE */}
        <section className="section-pad rural-grid" style={{ padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', width: '100%' }}>
          <div className="rural-img" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 420 }}>
            <img src={IMG.telemedRural} alt="Rural healthcare" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 55%,#090d18 100%)', pointerEvents: 'none' }} />
            <div style={{
              position: 'absolute', bottom: 24, right: 24,
              background: 'rgba(9,13,24,0.92)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12,
              padding: '12px 16px', animation: 'float 5s ease-in-out infinite',
            }}>
              <img src={IMG.hero} alt="Doctor" style={{ width: 90, height: 58, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: '#e2e8f0' }}>{T.rural.expertDoctors}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{T.rural.availableNow}</div>
            </div>
          </div>

          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 100, marginBottom: 24, width: 'fit-content',
              border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.07)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'block', animation: 'float 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{T.rural.badge}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(20px,2.8vw,40px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>
              {T.rural.title1}{' '}
              <span style={{ background: 'linear-gradient(90deg,#22d3ee,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {T.rural.title2}
              </span>
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 28, maxWidth: 400 }}>
              {T.rural.desc}
            </p>

            <ul style={{ listStyle: 'none', marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {T.rural.features.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="11" height="11" fill="#22d3ee" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button onClick={() => navigate('/login')} className="btn-primary" style={{
              padding: '13px 32px', borderRadius: 10,
              background: 'linear-gradient(90deg,#22d3ee,#34d399)',
              color: '#000', fontWeight: 800, fontSize: 14,
            }}>{T.rural.cta}</button>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="section-pad" style={{ padding: '0 24px 80px' }}>
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', padding: '72px 48px', textAlign: 'center' }}>
            <img src={IMG.telemedHero} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1d4ed8dd,#0e7490dd)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(18px,3vw,46px)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
                {T.cta.title}
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
                {T.cta.desc}
              </p>
              <div className="cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/login')} className="btn-primary" style={{
                  padding: '14px 36px', borderRadius: 10,
                  background: '#fff', color: '#1d4ed8', fontWeight: 800, fontSize: 15,
                }}>{T.cta.join}</button>
                <button className="btn-ghost" style={{
                  padding: '14px 36px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)', color: '#fff', fontWeight: 800, fontSize: 15,
                }}>{T.cta.demo}</button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 32px', background: 'rgba(6,9,16,0.6)' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <TelemedLogo size={32} />
                <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{T.nav.brand}</span>
              </div>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.75, maxWidth: 240 }}>
                {T.footer.tagline}
              </p>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>{T.footer.platform}</div>
              {[T.footer.login, T.footer.features, T.footer.network, T.footer.pricing].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <button className="footer-a" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 600 }}>{l}</button>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>{T.footer.company}</div>
              {[T.footer.about, T.footer.blog, T.footer.careers, T.footer.contact].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <button className="footer-a" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 600 }}>{l}</button>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>{T.footer.support}</div>
              {[{icon:'✉️',text:'help@telehealth.io'},{icon:'📞',text:'+91 (800) 999-5555'}].map(({icon,text}) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: '#475569', fontWeight: 600 }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
              {[T.footer.privacy, T.footer.terms].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <button className="footer-a" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#475569', fontWeight: 600 }}>{l}</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
            fontSize: 11, color: '#334155', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <div>{T.footer.copyright} {T.footer.rights}</div>
            <div style={{ display: 'flex', gap: 28 }}>
              {[T.footer.twitter, T.footer.linkedin, T.footer.instagram].map(s => (
                <a key={s} href="#" className="footer-a" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700, fontSize: 11 }}>{s}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default TelemedLandingPage;