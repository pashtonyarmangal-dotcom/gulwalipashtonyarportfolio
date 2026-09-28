/* ==========================================================================
   language.js — English / Pashto i18n with LTR / RTL switching
   ========================================================================== */

import storage from './storage.js';

const KEY = 'lang';
export const LANGS = ['en', 'ps'];

export const messages = {
  en: {
    'meta.title': 'Gul Wali — Web Designer & Software Developer',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.services': 'Services',
    'nav.resume': 'Resume',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.achievements': 'Achievements',
    'nav.menu': 'Menu',
    'nav.primary': 'Primary navigation',
    'nav.switchLang': 'Switch language',
    'nav.switchTheme': 'Switch theme',

    'hero.available': 'Available for Projects',
    'hero.unavailable': 'Currently Unavailable',
    'hero.viewWork': 'View My Work',
    'hero.downloadResume': 'Download Resume',
    'hero.contactMe': 'Contact Me',
    'hero.followMe': 'Find me online',

    'section.about': 'About Me',
    'section.aboutSub': 'Who I am and what I build.',
    'section.skills': 'Skills',
    'section.skillsSub': 'Technologies and tools I work with. Levels are self-assessed indicators, not measured scores.',
    'section.projects': 'Featured Projects',
    'section.projectsSub': 'A selection of the things I have designed and built.',
    'section.services': 'Services',
    'section.servicesSub': 'What I can build for you.',
    'section.stats': 'By the Numbers',
    'section.experience': 'Experience',
    'section.experienceSub': 'Honest, truthful development experience.',
    'section.education': 'Education',
    'section.achievements': 'Achievements',
    'section.achievementsSub': 'Real milestones only — nothing invented.',
    'section.blog': 'Latest Writing',
    'section.blogSub': 'Notes on frontend development, accessibility and interface design.',

    'about.focus': 'Focus',
    'about.philosophy': 'Philosophy',
    'about.currentFocus': 'Current Focus',
    'about.identity': 'Developer Identity',

    'btn.viewAll': 'View All',
    'btn.viewProject': 'View Details',
    'btn.viewArticle': 'Read Article',
    'btn.readMore': 'Read More',
    'btn.github': 'GitHub',
    'btn.live': 'Live Demo',
    'btn.back': 'Back',
    'btn.returnHome': 'Return Home',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.send': 'Send Message',

    'projects.search': 'Search projects...',
    'projects.all': 'All',
    'projects.empty': 'No projects found. Try a different search or filter.',
    'projects.loading': 'Loading projects...',
    'projects.error': 'Unable to load projects. Please try again.',
    'projects.count': 'project(s)',
    'projects.statusCompleted': 'Completed',
    'projects.statusInProgress': 'In Development',

    'details.overview': 'Overview',
    'details.problem': 'Problem',
    'details.solution': 'Solution',
    'details.features': 'Features',
    'details.technologies': 'Technologies',
    'details.screenshots': 'Screenshots',
    'details.challenges': 'Challenges',
    'details.learned': 'What I Learned',
    'details.links': 'Links',
    'details.notFound': 'Project not found.',
    'details.backToProjects': 'Back to Projects',
    'details.noLive': 'No public demo link has been configured for this project yet.',

    'blog.search': 'Search articles...',
    'blog.empty': 'No articles found.',
    'blog.loading': 'Loading articles...',
    'blog.error': 'Unable to load articles. Please try again.',
    'blog.readTime': 'min read',
    'blog.notFound': 'Article not found.',
    'blog.backToBlog': 'Back to Blog',
    'blog.published': 'Published',

    'contact.title': 'Get In Touch',
    'contact.sub': 'Have a project, a question or an idea? Send a message.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.success': '✓ Message sent successfully. Thank you for contacting me.',
    'contact.savedLocally': '✓ Message received. It has been saved locally in this browser. No email backend is connected yet, so the site owner will need to configure one to receive it by email.',
    'contact.error': 'Message could not be sent. Please try again.',
    'contact.errName': 'Please enter your name (at least 2 characters).',
    'contact.errEmail': 'Please enter a valid email address.',
    'contact.errSubject': 'Please enter a subject (at least 3 characters).',
    'contact.errMessage': 'Please write a message of at least 20 characters.',
    'contact.required': 'required',
    'contact.info': 'Contact Information',
    'contact.availability': 'Availability',

    'terminal.title': 'gulwali@portfolio',
    'terminal.hint': 'Type "help" and press Enter.',
    'terminal.welcome': 'Welcome, Gul Wali.',

    'stats.projects': 'Projects',
    'stats.technologies': 'Technologies',
    'stats.certificates': 'Certificates',
    'stats.learning': 'Years Learning',

    'state.loading': 'Loading...',
    'state.error': 'Something went wrong. Please try again.',
    'state.empty': 'Nothing to show yet.',

    'footer.tagline': 'Building useful digital experiences.',
    'footer.quickLinks': 'Quick Links',
    'footer.social': 'Social Links',
    'footer.rights': 'All Rights Reserved.',
    'footer.builtWith': 'Built with HTML, CSS and JavaScript.',

    'resume.view': 'View Resume',
    'resume.download': 'Download Resume',
    'resume.print': 'Print / Save as PDF',
    'resume.noFile': 'No resume file has been uploaded yet. Use “Print / Save as PDF” to generate one from this page.',
    'resume.profile': 'Profile',
    'resume.skills': 'Skills',
    'resume.experience': 'Experience',
    'resume.education': 'Education',
    'resume.contact': 'Contact',

    '404.title': 'PAGE NOT FOUND',
    '404.cmd': '$ cd /home',
    '404.fail': 'Command failed.',
    '404.hint': 'The page you requested does not exist on this server.',

    'lang.en': 'English',
    'lang.ps': 'پښتو'
  },

  ps: {
    'meta.title': 'ګل والي — وېب ډیزاینر او سافټویر جوړوونکی',
    'nav.home': 'کور',
    'nav.about': 'زما په اړه',
    'nav.skills': 'مهارتونه',
    'nav.projects': 'پروژې',
    'nav.services': 'خدمتونه',
    'nav.resume': 'سوانح',
    'nav.blog': 'بلاګ',
    'nav.contact': 'اړیکه',
    'nav.achievements': 'لاسته راوړنې',
    'nav.menu': 'مینو',
    'nav.primary': 'اصلي ناوبری',
    'nav.switchLang': 'ژبه بدله کړه',
    'nav.switchTheme': 'تیم بدل کړه',

    'hero.available': 'د پروژو لپاره چمتو',
    'hero.unavailable': 'اوس مهال بوخت',
    'hero.viewWork': 'زما کار وګورئ',
    'hero.downloadResume': 'سوانح ډاونلوډ کړئ',
    'hero.contactMe': 'اړیکه ونیسئ',
    'hero.followMe': 'آنلاین مې پیدا کړئ',

    'section.about': 'زما په اړه',
    'section.aboutSub': 'زه څوک یم او څه جوړوم.',
    'section.skills': 'مهارتونه',
    'section.skillsSub': 'هغه تخنیکي وسایل او ټیکنالوژۍ چې ورسره کار کوم. کچې زما خپل اټکل دي، نه اندازه شوي نمرې.',
    'section.projects': 'ځانګړې پروژې',
    'section.projectsSub': 'هغه څه چې ما ډیزاین او جوړ کړي دي.',
    'section.services': 'خدمتونه',
    'section.servicesSub': 'هغه څه چې زه ستاسو لپاره جوړولی شم.',
    'section.stats': 'په شمېرو کې',
    'section.experience': 'تجربه',
    'section.experienceSub': 'ریښتینې او صادقانه پراختیایي تجربه.',
    'section.education': 'زده کړې',
    'section.achievements': 'لاسته راوړنې',
    'section.achievementsSub': 'یوازې ریښتیني منځپانګې — هیڅ جوړ شوی نه دی.',
    'section.blog': 'وروستي لیکنې',
    'section.blogSub': 'د فرنټ‌اېنډ، لاسرسي او انټرفیس ډیزاین په اړه یادښتونه.',

    'about.focus': 'تمرکز',
    'about.philosophy': 'فلسفه',
    'about.currentFocus': 'اوسنی تمرکز',
    'about.identity': 'د پراختیا کوونکي هویت',

    'btn.viewAll': 'ټول وګورئ',
    'btn.viewProject': 'تفصیلات وګورئ',
    'btn.viewArticle': 'مقاله ولولئ',
    'btn.readMore': 'نور ولولئ',
    'btn.github': 'GitHub',
    'btn.live': 'ژوندی ډیمو',
    'btn.back': 'بیرته',
    'btn.returnHome': 'کور ته بیرته',
    'btn.save': 'خوندي کړه',
    'btn.cancel': 'لغوه',
    'btn.send': 'پیغام ولېږه',

    'projects.search': 'پروژې ولټوه...',
    'projects.all': 'ټول',
    'projects.empty': 'هیڅ پروژه ونه موندل شوه. بل فلټر یا لټون هڅه وکړئ.',
    'projects.loading': 'پروژې بارېږي...',
    'projects.error': 'پروژې بار نه شوې. بیا هڅه وکړئ.',
    'projects.count': 'پروژه',
    'projects.statusCompleted': 'بشپړه',
    'projects.statusInProgress': 'په جوړېدو کې',

    'details.overview': 'عمومي کتنه',
    'details.problem': 'ستونزه',
    'details.solution': 'حل',
    'details.features': 'ځانګړنې',
    'details.technologies': 'ټیکنالوژۍ',
    'details.screenshots': 'سکرین‌شاټونه',
    'details.challenges': 'ننګونې',
    'details.learned': 'څه زده کړل',
    'details.links': 'لینکونه',
    'details.notFound': 'پروژه ونه موندل شوه.',
    'details.backToProjects': 'پروژو ته بیرته',
    'details.noLive': 'د دې پروژې لپاره تر اوسه د ډیمو لینک نه دی ټاکل شوی.',

    'blog.search': 'مقالې ولټوه...',
    'blog.empty': 'هیڅ مقاله ونه موندل شوه.',
    'blog.loading': 'مقالې بارېږي...',
    'blog.error': 'مقالې بار نه شوې. بیا هڅه وکړئ.',
    'blog.readTime': 'دقیقې لوستل',
    'blog.notFound': 'مقاله ونه موندل شوه.',
    'blog.backToBlog': 'بلاګ ته بیرته',
    'blog.published': 'خپره شوې',

    'contact.title': 'اړیکه ونیسئ',
    'contact.sub': 'پروژه، پوښتنه یا نظر لرئ؟ پیغام ولېږئ.',
    'contact.name': 'نوم',
    'contact.email': 'بریښنالیک',
    'contact.subject': 'موضوع',
    'contact.message': 'پیغام',
    'contact.send': 'پیغام ولېږه',
    'contact.sending': 'لېږل کېږي...',
    'contact.success': '✓ پیغام په بریالیتوب سره ولېږل شو. د اړیکې لپاره مننه.',
    'contact.savedLocally': '✓ پیغام ترلاسه شو او په دې براوزر کې ځایي خوندي شو. تر اوسه د بریښنالیک بیک‌اېنډ نه دی وصل شوی.',
    'contact.error': 'پیغام ولېږل نشو. بیا هڅه وکړئ.',
    'contact.errName': 'مهرباني وکړئ خپل نوم ولیکئ (لږ تر لږه ۲ توري).',
    'contact.errEmail': 'مهرباني وکړئ سم بریښنالیک ولیکئ.',
    'contact.errSubject': 'مهرباني وکړئ موضوع ولیکئ (لږ تر لږه ۳ توري).',
    'contact.errMessage': 'مهرباني وکړئ لږ تر لږه ۲۰ توري پیغام ولیکئ.',
    'contact.required': 'اړین',
    'contact.info': 'د اړیکې معلومات',
    'contact.availability': 'شتون',

    'terminal.title': 'gulwali@portfolio',
    'terminal.hint': 'د "help" ټایپ کړئ او Enter کېکاږئ.',
    'terminal.welcome': 'ښه راغلاست، ګل والي.',

    'stats.projects': 'پروژې',
    'stats.technologies': 'ټیکنالوژۍ',
    'stats.certificates': 'سندونه',
    'stats.learning': 'د زده کړې کلونه',

    'state.loading': 'بارېږي...',
    'state.error': 'یو څه سم نه شول. بیا هڅه وکړئ.',
    'state.empty': 'تر اوسه څه نشته.',

    'footer.tagline': 'ګټورې ډیجیټل تجربې جوړوو.',
    'footer.quickLinks': 'چټک لینکونه',
    'footer.social': 'ټولنیز لینکونه',
    'footer.rights': 'ټول حقوق محفوظ دي.',
    'footer.builtWith': 'د HTML، CSS او JavaScript سره جوړ شوی.',

    'resume.view': 'سوانح وګورئ',
    'resume.download': 'سوانح ډاونلوډ کړئ',
    'resume.print': 'چاپ / PDF خوندي کړه',
    'resume.noFile': 'تر اوسه د سوانح فایل نه دی پورته شوی. د «چاپ / PDF» تڼۍ په کارولو سره له دې پاڼې فایل جوړ کړئ.',
    'resume.profile': 'پروفایل',
    'resume.skills': 'مهارتونه',
    'resume.experience': 'تجربه',
    'resume.education': 'زده کړې',
    'resume.contact': 'اړیکه',

    '404.title': 'پاڼه ونه موندل شوه',
    '404.cmd': '$ cd /home',
    '404.fail': 'کمانډ ناکام شو.',
    '404.hint': 'هغه پاڼه چې غوښتل شوې وه په دې سرور کې نشته.',

    'lang.en': 'English',
    'lang.ps': 'پښتو'
  }
};

export function currentLang() {
  return 'en';
}

export function t(key, lang = currentLang()) {
  const table = messages[lang] || messages.en;
  return table[key] ?? messages.en[key] ?? key;
}

/** Pick a localized field from a data object: fieldPs when lang is ps and present. */
export function localized(obj, field, lang = currentLang()) {
  if (!obj) return '';
  if (lang === 'ps') {
    const ps = obj[field + 'Ps'];
    if (ps !== undefined && ps !== null && ps !== '') return ps;
  }
  return obj[field] ?? '';
}

export function applyLanguage(lang) {
  const next = LANGS.includes(lang) ? lang : 'en';
  const html = document.documentElement;

  html.lang = next;
  html.dir = next === 'ps' ? 'rtl' : 'ltr';
  storage.set(KEY, next);

  // textContent translations
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const value = t(key, next);
    if (value) el.textContent = value;
  });

  // attribute translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder, next));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel, next));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.dataset.i18nTitle, next));
  });

  // document title
  const titleKey = html.dataset.titleKey;
  if (titleKey) document.title = t(titleKey, next);

  // language toggle button label shows the *other* language
  document.querySelectorAll('[data-lang-label]').forEach((el) => {
    el.textContent = next === 'en' ? messages.en['lang.ps'] : messages.ps['lang.en'];
  });

  document.dispatchEvent(new CustomEvent('gw:language', { detail: { lang: next } }));
}

export function toggleLanguage() {
  // Language switching disabled — site is English only.
  return;
}

export function initLanguage() {
  applyLanguage(currentLang());
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleLanguage);
  });
}