import { defaultLocale, type AppLocale } from "@/i18n/routing";

type FeedbackCopy = {
  appCta: string;
  appHref: string;
  errorDescription: string;
  errorRetry: string;
  errorTitle: string;
  homeCta: string;
  homeHref: string;
  loadingEyebrow: string;
  loadingDescription: string;
  loadingTitle: string;
  notFoundEyebrow: string;
  notFoundDescription: string;
  notFoundTitle: string;
};

const copyByLocale: Record<AppLocale, FeedbackCopy> = {
  "pt-BR": {
    appCta: "Voltar para o app",
    appHref: "/app",
    errorDescription:
      "Esta tela teve um problema inesperado. Você pode tentar de novo ou voltar para o app.",
    errorRetry: "Tentar novamente",
    errorTitle: "Algo saiu do esperado.",
    homeCta: "Ir para a home",
    homeHref: "/",
    loadingEyebrow: "Abrindo sua conta",
    loadingDescription: "Estamos preparando os dados desta etapa.",
    loadingTitle: "Carregando...",
    notFoundEyebrow: "Rota indisponível",
    notFoundDescription:
      "O caminho que você tentou abrir não está disponível.",
    notFoundTitle: "Página não encontrada.",
  },
  "en-US": {
    appCta: "Back to app",
    appHref: "/app",
    errorDescription:
      "This screen hit an unexpected problem. You can retry or go back to the app.",
    errorRetry: "Try again",
    errorTitle: "Something went off track.",
    homeCta: "Go to home",
    homeHref: "/",
    loadingEyebrow: "Opening your account",
    loadingDescription: "We are preparing the data for this step.",
    loadingTitle: "Loading...",
    notFoundEyebrow: "Unavailable route",
    notFoundDescription:
      "The page you tried to open is not available.",
    notFoundTitle: "Page not found.",
  },
  "es-ES": {
    appCta: "Volver al app",
    appHref: "/app",
    errorDescription:
      "Esta pantalla tuvo un problema inesperado. Puedes reintentar o volver al app.",
    errorRetry: "Reintentar",
    errorTitle: "Algo se desvió.",
    homeCta: "Ir al inicio",
    homeHref: "/",
    loadingEyebrow: "Abriendo tu cuenta",
    loadingDescription: "Estamos preparando los datos de esta etapa.",
    loadingTitle: "Cargando...",
    notFoundEyebrow: "Ruta no disponible",
    notFoundDescription:
      "La página que intentaste abrir no está disponible.",
    notFoundTitle: "Página no encontrada.",
  },
};

export function getFeedbackCopy(locale: string) {
  return copyByLocale[(copyByLocale[locale as AppLocale] ? locale : defaultLocale) as AppLocale];
}
