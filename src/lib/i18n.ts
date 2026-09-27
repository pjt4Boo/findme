import type { Language } from '@/types';

export type TranslationKey =
  | 'app.name'
  | 'app.tagline'
  | 'app.emergencyNotice'
  | 'landing.foundSomeone'
  | 'landing.lookingForSomeone'
  | 'landing.searchNearby'
  | 'landing.heroTitle'
  | 'landing.heroSubtitle'
  | 'nav.home'
  | 'nav.myCases'
  | 'nav.notifications'
  | 'nav.profile'
  | 'nav.admin'
  | 'nav.login'
  | 'nav.register'
  | 'nav.logout'
  | 'nav.privacyPolicy'
  | 'nav.terms'
  | 'nav.help'
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.fullName'
  | 'auth.confirmPassword'
  | 'auth.loginButton'
  | 'auth.registerButton'
  | 'auth.noAccount'
  | 'auth.haveAccount'
  | 'auth.loginError'
  | 'auth.registerError'
  | 'auth.logoutSuccess'
  | 'case.found'
  | 'case.missing'
  | 'case.reportFound'
  | 'case.reportMissing'
  | 'case.nearbyCases'
  | 'case.caseDetails'
  | 'case.potentialMatches'
  | 'case.viewCase'
  | 'case.contactHelper'
  | 'case.report'
  | 'case.age'
  | 'case.gender'
  | 'case.clothing'
  | 'case.description'
  | 'case.location'
  | 'case.dateTime'
  | 'case.personName'
  | 'case.approxAge'
  | 'case.lastSeen'
  | 'case.foundAt'
  | 'case.policeReference'
  | 'case.additionalInfo'
  | 'case.consent'
  | 'case.submit'
  | 'case.cancel'
  | 'case.uploadPhoto'
  | 'case.selectLocation'
  | 'case.radius'
  | 'case.searchNearby'
  | 'case.noCasesFound'
  | 'case.loadingCases'
  | 'case.confirmMatch'
  | 'case.notAMatch'
  | 'case.potentialMatch'
  | 'case.distance'
  | 'case.ageSimilarity'
  | 'case.descriptionSimilarity'
  | 'case.matchConfirmed'
  | 'case.matchRejected'
  | 'chat.sendMessage'
  | 'chat.noMessages'
  | 'chat.secureChat'
  | 'notif.markAllRead'
  | 'notif.noNotifications'
  | 'notif.unread'
  | 'admin.dashboard'
  | 'admin.cases'
  | 'admin.pendingReview'
  | 'admin.reports'
  | 'admin.users'
  | 'admin.notifications'
  | 'admin.auditLogs'
  | 'admin.settings'
  | 'admin.activeCases'
  | 'admin.pendingReviewCount'
  | 'admin.reportedCases'
  | 'admin.reunitedCases'
  | 'admin.activeUsers'
  | 'admin.suspendedUsers'
  | 'admin.approve'
  | 'admin.reject'
  | 'admin.requestInfo'
  | 'admin.hide'
  | 'admin.remove'
  | 'admin.suspend'
  | 'admin.restore'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.save'
  | 'common.cancel'
  | 'common.close'
  | 'common.search'
  | 'common.back'
  | 'common.notFound'
  | 'common.unauthorized'
  | 'common.forbidden'
  | 'common.pageNotFound'
  | 'common.accessDenied'
  | 'common.yes'
  | 'common.no'
  | 'common.confirm'
  | 'common.delete'
  | 'common.edit';

type Translations = Record<Language, Record<TranslationKey, string>>;

const translations: Translations = {
  en: {
    'app.name': 'Find Me',
    'app.tagline': 'Help reconnect people with their families.',
    'app.emergencyNotice':
      'If a person is in immediate danger or requires urgent assistance, contact the appropriate local emergency or police service.',
    'landing.foundSomeone': "I've Found Someone",
    'landing.lookingForSomeone': "I'm Looking for Someone",
    'landing.searchNearby': 'Search Nearby',
    'landing.heroTitle': 'Find Me',
    'landing.heroSubtitle': 'Help reconnect people with their families.',
    'nav.home': 'Home',
    'nav.myCases': 'My Cases',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.privacyPolicy': 'Privacy Policy',
    'nav.terms': 'Terms & Conditions',
    'nav.help': 'Help & Safety',
    'auth.login': 'Login',
    'auth.register': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.loginError': 'Invalid email or password.',
    'auth.registerError': 'Could not create account. Please try again.',
    'auth.logoutSuccess': 'You have been logged out.',
    'case.found': 'Found',
    'case.missing': 'Missing',
    'case.reportFound': 'Report Person Found',
    'case.reportMissing': 'Report Missing Person',
    'case.nearbyCases': 'Nearby Cases',
    'case.caseDetails': 'Case Details',
    'case.potentialMatches': 'Potential Matches',
    'case.viewCase': 'View Case',
    'case.contactHelper': 'Contact Helper',
    'case.report': 'Report',
    'case.age': 'Age',
    'case.gender': 'Gender',
    'case.clothing': 'Clothing',
    'case.description': 'Description',
    'case.location': 'Approximate Location',
    'case.dateTime': 'Date & Time',
    'case.personName': 'Person Name',
    'case.approxAge': 'Approximate Age',
    'case.lastSeen': 'Last Seen',
    'case.foundAt': 'Found At',
    'case.policeReference': 'Police Complaint / Reference (Optional)',
    'case.additionalInfo': 'Additional Information',
    'case.consent':
      'I understand that this information may be reviewed and that I should not submit unnecessary private information.',
    'case.submit': 'Submit Case',
    'case.cancel': 'Cancel',
    'case.uploadPhoto': 'Upload Photo',
    'case.selectLocation': 'Select Approximate Location',
    'case.radius': 'Search Radius',
    'case.searchNearby': 'Search Nearby',
    'case.noCasesFound': 'No cases found in this area.',
    'case.loadingCases': 'Loading nearby cases...',
    'case.confirmMatch': 'Confirm Match',
    'case.notAMatch': 'Not a Match',
    'case.potentialMatch': 'Potential Match',
    'case.distance': 'Distance',
    'case.ageSimilarity': 'Age Similarity',
    'case.descriptionSimilarity': 'Description Similarity',
    'case.matchConfirmed': 'Match confirmed. The case will be reviewed.',
    'case.matchRejected': 'Match rejected.',
    'chat.sendMessage': 'Send a message',
    'chat.noMessages': 'No messages yet. Start the conversation.',
    'chat.secureChat': 'Secure Chat',
    'notif.markAllRead': 'Mark all as read',
    'notif.noNotifications': 'No notifications.',
    'notif.unread': 'unread',
    'admin.dashboard': 'Dashboard',
    'admin.cases': 'Cases',
    'admin.pendingReview': 'Pending Review',
    'admin.reports': 'Reports',
    'admin.users': 'Users',
    'admin.notifications': 'Notifications',
    'admin.auditLogs': 'Audit Logs',
    'admin.settings': 'Settings',
    'admin.activeCases': 'Active Cases',
    'admin.pendingReviewCount': 'Pending Review',
    'admin.reportedCases': 'Reported Cases',
    'admin.reunitedCases': 'Reunited Cases',
    'admin.activeUsers': 'Active Users',
    'admin.suspendedUsers': 'Suspended Users',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.requestInfo': 'Request Information',
    'admin.hide': 'Hide',
    'admin.remove': 'Remove',
    'admin.suspend': 'Suspend',
    'admin.restore': 'Restore',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong.',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.back': 'Back',
    'common.notFound': 'Not Found',
    'common.unauthorized': 'Unauthorized',
    'common.forbidden': 'Access Denied',
    'common.pageNotFound': 'The page you are looking for does not exist.',
    'common.accessDenied': 'You do not have permission to access this page.',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  ta: {
    'app.name': 'Find Me',
    'app.tagline': 'மக்களை அவர்களின் குடும்பத்துடன் மீண்டும் இணைக்க உதவுங்கள்.',
    'app.emergencyNotice':
      'ஒருவர் உடனடி ஆபத்தில் இருந்தால், உரிய அவசர அல்லது காவல் சேவையைத் தொடர்பு கொள்ளுங்கள்.',
    'landing.foundSomeone': 'நான் ஒருவரைக் கண்டுபிடித்தேன்',
    'landing.lookingForSomeone': 'நான் யாரையோ தேடுகிறேன்',
    'landing.searchNearby': 'அருகில் தேடு',
    'landing.heroTitle': 'Find Me',
    'landing.heroSubtitle': 'மக்களை அவர்களின் குடும்பத்துடன் மீண்டும் இணைக்க உதவுங்கள்.',
    'nav.home': 'முகப்பு',
    'nav.myCases': 'எனது வழக்குகள்',
    'nav.notifications': 'அறிவிப்புகள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.admin': 'நிர்வாகம்',
    'nav.login': 'உள்நுழைய',
    'nav.register': 'பதிவு செய்',
    'nav.logout': 'வெளியேறு',
    'nav.privacyPolicy': 'தனியுரிமைக் கொள்கை',
    'nav.terms': 'விதிகள் & நிபந்தனைகள்',
    'nav.help': 'உதவி & பாதுகாப்பு',
    'auth.login': 'உள்நுழைய',
    'auth.register': 'கணக்கை உருவாக்கு',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.fullName': 'முழுப் பெயர்',
    'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்து',
    'auth.loginButton': 'உள்நுழைய',
    'auth.registerButton': 'கணக்கை உருவாக்கு',
    'auth.noAccount': 'கணக்கு இல்லையா?',
    'auth.haveAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.loginError': 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.',
    'auth.registerError': 'கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    'auth.logoutSuccess': 'நீங்கள் வெளியேறிவிட்டீர்கள்.',
    'case.found': 'கண்டுபிடிக்கப்பட்டது',
    'case.missing': 'காணாமல் போனது',
    'case.reportFound': 'கண்டுபிடித்த நபரைப் புகாரளி',
    'case.reportMissing': 'காணாமல் போன நபரைப் புகாரளி',
    'case.nearbyCases': 'அருகிலுள்ள வழக்குகள்',
    'case.caseDetails': 'வழக்கு விவரங்கள்',
    'case.potentialMatches': 'சாத்தியமான பொருத்தங்கள்',
    'case.viewCase': 'வழக்கைப் பார்',
    'case.contactHelper': 'உதவியாளரைத் தொடர்பு கொள்ளுங்கள்',
    'case.report': 'புகார்',
    'case.age': 'வயது',
    'case.gender': 'பாலினம்',
    'case.clothing': 'ஆடை',
    'case.description': 'விளக்கம்',
    'case.location': 'தோராயமான இடம்',
    'case.dateTime': 'தேதி & நேரம்',
    'case.personName': 'நபரின் பெயர்',
    'case.approxAge': 'தோராயமான வயது',
    'case.lastSeen': 'கடைசியாகப் பார்த்தது',
    'case.foundAt': 'கண்டுபிடித்த இடம்',
    'case.policeReference': 'காவல் புகார் / குறிப்பு (விரும்பினால்)',
    'case.additionalInfo': 'கூடுதல் தகவல்',
    'case.consent':
      'இந்தத் தகவல் மதிப்பாய்வு செய்யப்படலாம் என்பதையும், தேவையற்ற தனிப்பட்ட தகவல்களைச் சமர்ப்பிக்கக் கூடாது என்பதையும் நான் புரிந்துகொள்கிறேன்.',
    'case.submit': 'வழக்கைச் சமர்ப்பிக்கவும்',
    'case.cancel': 'ரத்து',
    'case.uploadPhoto': 'புகைப்படம் பதிவேற்று',
    'case.selectLocation': 'தோராயமான இடத்தைத் தேர்ந்தெடுக்கவும்',
    'case.radius': 'தேடல் ஆரம்',
    'case.searchNearby': 'அருகில் தேடு',
    'case.noCasesFound': 'இப்பகுதியில் வழக்குகள் இல்லை.',
    'case.loadingCases': 'அருகிலுள்ள வழக்குகளை ஏற்றுகிறது...',
    'case.confirmMatch': 'பொருத்தத்தை உறுதிப்படுத்து',
    'case.notAMatch': 'பொருத்தம் அல்ல',
    'case.potentialMatch': 'சாத்தியமான பொருத்தம்',
    'case.distance': 'தூரம்',
    'case.ageSimilarity': 'வயது ஒற்றுமை',
    'case.descriptionSimilarity': 'விளக்க ஒற்றுமை',
    'case.matchConfirmed': 'பொருத்தம் உறுதிப்படுத்தப்பட்டது.',
    'case.matchRejected': 'பொருத்தம் நிராகரிக்கப்பட்டது.',
    'chat.sendMessage': 'செய்தி அனுப்பு',
    'chat.noMessages': 'இன்னும் செய்திகள் இல்லை.',
    'chat.secureChat': 'பாதுகாப்பான அரட்டை',
    'notif.markAllRead': 'அனைத்தையும் படித்ததாகக் குறி',
    'notif.noNotifications': 'அறிவிப்புகள் இல்லை.',
    'notif.unread': 'படிக்காத',
    'admin.dashboard': 'டாஷ்போர்டு',
    'admin.cases': 'வழக்குகள்',
    'admin.pendingReview': 'மதிப்பாய்வு நிலுவை',
    'admin.reports': 'புகார்கள்',
    'admin.users': 'பயனர்கள்',
    'admin.notifications': 'அறிவிப்புகள்',
    'admin.auditLogs': 'தணிக்கை பதிவுகள்',
    'admin.settings': 'அமைப்புகள்',
    'admin.activeCases': 'செயலில் உள்ள வழக்குகள்',
    'admin.pendingReviewCount': 'மதிப்பாய்வு நிலுவை',
    'admin.reportedCases': 'புகாரளிக்கப்பட்ட வழக்குகள்',
    'admin.reunitedCases': 'மீண்டும் இணைக்கப்பட்ட வழக்குகள்',
    'admin.activeUsers': 'செயலில் உள்ள பயனர்கள்',
    'admin.suspendedUsers': 'இடைநிறுத்தப்பட்ட பயனர்கள்',
    'admin.approve': 'அங்கீகரி',
    'admin.reject': 'நிராகரி',
    'admin.requestInfo': 'தகவல் கேள்',
    'admin.hide': 'மறை',
    'admin.remove': 'அகற்று',
    'admin.suspend': 'இடைநிறுத்து',
    'admin.restore': 'மீட்டமெய்',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'ஏதோ தவறு நடந்தது.',
    'common.retry': 'மீண்டும் முயற்சி',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து',
    'common.close': 'மூடு',
    'common.search': 'தேடு',
    'common.back': 'பின்செல்',
    'common.notFound': 'காணப்படவில்லை',
    'common.unauthorized': 'அங்கீகாரம் இல்லை',
    'common.forbidden': 'அணுகல் மறுக்கப்பட்டது',
    'common.pageNotFound': 'நீங்கள் தேடும் பக்கம் இல்லை.',
    'common.accessDenied': 'இந்தப் பக்கத்தை அணுக உங்களுக்கு அனுமதி இல்லை.',
    'common.yes': 'ஆம்',
    'common.no': 'இல்லை',
    'common.confirm': 'உறுதிப்படுத்து',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
  },
  hi: {
    'app.name': 'Find Me',
    'app.tagline': 'लोगों को उनके परिवार से फिर से जोड़ने में मदद करें।',
    'app.emergencyNotice':
      'यदि कोई व्यक्ति तत्काल खतरे में है, तो उपयुक्त आपातकालीन या पुलिस सेवा से संपर्क करें।',
    'landing.foundSomeone': 'मैंने किसी को पाया है',
    'landing.lookingForSomeone': 'मैं किसी को ढूंढ रहा हूं',
    'landing.searchNearby': 'आसपास खोजें',
    'landing.heroTitle': 'Find Me',
    'landing.heroSubtitle': 'लोगों को उनके परिवार से फिर से जोड़ने में मदद करें।',
    'nav.home': 'होम',
    'nav.myCases': 'मेरे मामले',
    'nav.notifications': 'सूचनाएं',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.admin': 'व्यवस्थापक',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'nav.logout': 'लॉगआउट',
    'nav.privacyPolicy': 'गोपनीयता नीति',
    'nav.terms': 'नियम एवं शर्तें',
    'nav.help': 'सहायता एवं सुरक्षा',
    'auth.login': 'लॉगिन',
    'auth.register': 'खाता बनाएं',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullName': 'पूरा नाम',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.loginButton': 'लॉगिन',
    'auth.registerButton': 'खाता बनाएं',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.haveAccount': 'पहले से खाता है?',
    'auth.loginError': 'गलत ईमेल या पासवर्ड।',
    'auth.registerError': 'खाता नहीं बनाया जा सका। पुनः प्रयास करें।',
    'auth.logoutSuccess': 'आप लॉग आउट हो गए हैं।',
    'case.found': 'मिला',
    'case.missing': 'लापता',
    'case.reportFound': 'मिले व्यक्ति की रिपोर्ट करें',
    'case.reportMissing': 'लापता व्यक्ति की रिपोर्ट करें',
    'case.nearbyCases': 'आसपास के मामले',
    'case.caseDetails': 'मामले का विवरण',
    'case.potentialMatches': 'संभावित मिलान',
    'case.viewCase': 'मामला देखें',
    'case.contactHelper': 'सहायक से संपर्क करें',
    'case.report': 'रिपोर्ट',
    'case.age': 'आयु',
    'case.gender': 'लिंग',
    'case.clothing': 'वस्त्र',
    'case.description': 'विवरण',
    'case.location': 'अनुमानित स्थान',
    'case.dateTime': 'दिनांक एवं समय',
    'case.personName': 'व्यक्ति का नाम',
    'case.approxAge': 'अनुमानित आयु',
    'case.lastSeen': 'अंतिम बार देखा गया',
    'case.foundAt': 'मिलने का स्थान',
    'case.policeReference': 'पुलिस शिकायत / संदर्भ (वैकल्पिक)',
    'case.additionalInfo': 'अतिरिक्त जानकारी',
    'case.consent':
      'मैं समझता हूं कि इस जानकारी की समीक्षा की जा सकती है और मुझे अनावश्य निजी जानकारी सबमिट नहीं करनी चाहिए।',
    'case.submit': 'मामला सबमिट करें',
    'case.cancel': 'रद्द करें',
    'case.uploadPhoto': 'फोटो अपलोड करें',
    'case.selectLocation': 'अनुमानित स्थान चुनें',
    'case.radius': 'खोज त्रिज्या',
    'case.searchNearby': 'आसपास खोजें',
    'case.noCasesFound': 'इस क्षेत्र में कोई मामले नहीं मिले।',
    'case.loadingCases': 'आसपास के मामले लोड हो रहे हैं...',
    'case.confirmMatch': 'मिलान की पुष्टि करें',
    'case.notAMatch': 'मिलान नहीं',
    'case.potentialMatch': 'संभावित मिलान',
    'case.distance': 'दूरी',
    'case.ageSimilarity': 'आयु समानता',
    'case.descriptionSimilarity': 'विवरण समानता',
    'case.matchConfirmed': 'मिलान की पुष्टि हुई।',
    'case.matchRejected': 'मिलान अस्वीकृत।',
    'chat.sendMessage': 'संदेश भेजें',
    'chat.noMessages': 'अभी कोई संदेश नहीं।',
    'chat.secureChat': 'सुरक्षित चैट',
    'notif.markAllRead': 'सभी पढ़ा हुआ चिह्नित करें',
    'notif.noNotifications': 'कोई सूचना नहीं।',
    'notif.unread': 'अपठित',
    'admin.dashboard': 'डैशबोर्ड',
    'admin.cases': 'मामले',
    'admin.pendingReview': 'समीक्षा लंबित',
    'admin.reports': 'रिपोर्ट',
    'admin.users': 'उपयोगकर्ता',
    'admin.notifications': 'सूचनाएं',
    'admin.auditLogs': 'ऑडिट लॉग',
    'admin.settings': 'सेटिंग्स',
    'admin.activeCases': 'सक्रिय मामले',
    'admin.pendingReviewCount': 'समीक्षा लंबित',
    'admin.reportedCases': 'रिपोर्ट किए गए मामले',
    'admin.reunitedCases': 'पुनर्मिलन मामले',
    'admin.activeUsers': 'सक्रिय उपयोगकर्ता',
    'admin.suspendedUsers': 'निलंबित उपयोगकर्ता',
    'admin.approve': 'स्वीकृत करें',
    'admin.reject': 'अस्वीकृत करें',
    'admin.requestInfo': 'जानकारी मांगें',
    'admin.hide': 'छिपाएं',
    'admin.remove': 'हटाएं',
    'admin.suspend': 'निलंबित करें',
    'admin.restore': 'पुनर्स्थापित करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'कुछ गलत हुआ।',
    'common.retry': 'पुनः प्रयास',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.close': 'बंद करें',
    'common.search': 'खोजें',
    'common.back': 'वापस',
    'common.notFound': 'नहीं मिला',
    'common.unauthorized': 'अनधिकृत',
    'common.forbidden': 'पहुंच अस्वीकृत',
    'common.pageNotFound': 'आप जो पेज ढूंढ रहे हैं वह मौजूद नहीं है।',
    'common.accessDenied': 'आपको इस पेज तक पहुंच की अनुमति नहीं है।',
    'common.yes': 'हां',
    'common.no': 'नहीं',
    'common.confirm': 'पुष्टि करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
  },
};

export function translate(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
