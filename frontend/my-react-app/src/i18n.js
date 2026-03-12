import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      Announcements: "Announcements",
      Comments: "Comments",
      "Show comments": "Show comments",
      "Hide comments": "Hide comments",
      Profile: "Profile",
      "Save Profile": "Save Profile",
      "Vaccine Schedule": "Vaccine Schedule",
      Emergency: "Emergency",
      Notifications: "Notifications",
      "Audit Log": "Audit Log",
      "Title and body required": "Title and body required",
      "Announcement posted": "Announcement posted",
      "Failed to post announcement": "Failed to post announcement",
      "Reply cannot be empty": "Reply cannot be empty",
      "Replied to comment": "Replied to comment",
      "Failed to post reply": "Failed to post reply",
      "Community Dashboard": "Community Dashboard",
      "No announcements yet.": "No announcements yet.",
      "No notifications": "No notifications",
      Settings: "Settings",
      Avatar: "Avatar",
      "Change avatar": "Change avatar",
      Language: "Language",
      "Enable push notifications": "Enable push notifications",
      "Save Settings": "Save Settings",
      "Export Logs (CSV)": "Export Logs (CSV)",
      "Download Health Report (PDF)": "Download Health Report (PDF)",
      // add more keys as needed
    },
  },
  es: {
    translation: {
      Announcements: "Anuncios",
      Comments: "Comentarios",
      "Show comments": "Mostrar comentarios",
      "Hide comments": "Ocultar comentarios",
      Profile: "Perfil",
      "Save Profile": "Guardar perfil",
      "Vaccine Schedule": "Calendario de vacunas",
      Emergency: "Emergencia",
      Notifications: "Notificaciones",
      "Audit Log": "Registro de auditoría",
      "Title and body required": "Título y contenido requeridos",
      "Announcement posted": "Anuncio publicado",
      "Failed to post announcement": "Error al publicar el anuncio",
      "Reply cannot be empty": "La respuesta no puede estar vacía",
      "Replied to comment": "Respondió al comentario",
      "Failed to post reply": "Error al publicar la respuesta",
      "Community Dashboard": "Panel comunitario",
      "No announcements yet.": "No hay anuncios aún.",
      "No notifications": "Sin notificaciones",
      Settings: "Configuración",
      Avatar: "Avatar",
      "Change avatar": "Cambiar avatar",
      Language: "Idioma",
      "Enable push notifications": "Habilitar notificaciones push",
      "Save Settings": "Guardar configuración",
      "Export Logs (CSV)": "Exportar registros (CSV)",
      "Download Health Report (PDF)": "Descargar informe de salud (PDF)",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
