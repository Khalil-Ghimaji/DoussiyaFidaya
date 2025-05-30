export type Locale = "fr" | "ar"

export const locales: Record<Locale, Record<string, string>> = {
  fr: {
    // Général
    appName: "Système de Gestion Médicale",
    login: "Connexion",
    register: "Inscription",
    logout: "Déconnexion",
    dashboard: "Tableau de bord",

    // Rôles
    patient: "Patient",
    doctor: "Médecin",
    laboratory: "Laboratoire",
    pharmacy: "Pharmacie",

    // Navigation
    home: "Accueil",
    about: "À propos",
    contact: "Contact",

    // Espaces
    patientSpace: "Espace Patient",
    doctorSpace: "Espace Médecin",
    laboratorySpace: "Espace Laboratoire",
    pharmacySpace: "Espace Pharmacie",
    assistantSpace: "Espace Assistant",

    // Fonctionnalités
    appointments: "Rendez-vous",
    prescriptions: "Ordonnances",
    labResults: "Résultats d'analyses",
    medicalRecord: "Dossier médical",

    // Actions
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    download: "Télécharger",
    upload: "Téléverser",

    // Statuts
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
    active: "Actif",
    expired: "Expiré",
    delivered: "Délivré",

    // Messages
    welcome: "Bienvenue",
    errorOccurred: "Une erreur est survenue",
    successOperation: "Opération réussie",
  },
  ar: {
    // Général
    appName: "نظام إدارة الصحة",
    login: "تسجيل الدخول",
    register: "التسجيل",
    logout: "تسجيل الخروج",
    dashboard: "لوحة التحكم",

    // Rôles
    patient: "مريض",
    doctor: "طبيب",
    laboratory: "مختبر",
    pharmacy: "صيدلية",

    // Navigation
    home: "الرئيسية",
    about: "حول",
    contact: "اتصل بنا",

    // Espaces
    patientSpace: "فضاء المريض",
    doctorSpace: "فضاء الطبيب",
    laboratorySpace: "فضاء المختبر",
    pharmacySpace: "فضاء الصيدلية",
    assistantSpace: "فضاء المساعد",

    // Fonctionnalités
    appointments: "المواعيد",
    prescriptions: "الوصفات الطبية",
    labResults: "نتائج التحاليل",
    medicalRecord: "السجل الطبي",

    // Actions
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    view: "عرض",
    download: "تحميل",
    upload: "رفع",

    // Statuts
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغى",
    completed: "مكتمل",
    active: "نشط",
    expired: "منتهي الصلاحية",
    delivered: "تم التسليم",

    // Messages
    welcome: "مرحبا",
    errorOccurred: "حدث خطأ",
    successOperation: "تمت العملية بنجاح",
  },
}

