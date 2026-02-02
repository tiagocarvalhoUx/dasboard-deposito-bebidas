/**
 * Converte uma data do Firestore (Timestamp) para Date
 */
export function convertFirestoreDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  }
  if (date?.toDate && typeof date.toDate === "function") {
    return date.toDate();
  }
  if (date?.seconds) {
    return new Date(date.seconds * 1000);
  }
  return new Date(date);
}

/**
 * Formata uma data para exibição em pt-BR
 */
export function formatDate(date: any): string {
  const d = convertFirestoreDate(date);
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data e hora para exibição em pt-BR
 */
export function formatDateTime(date: any): string {
  const d = convertFirestoreDate(date);
  return d.toLocaleString("pt-BR");
}
