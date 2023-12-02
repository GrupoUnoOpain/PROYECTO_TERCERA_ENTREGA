export interface Flight {
  "id": number;
  "IATA CODE": string;
  "Destino": string;
  "Tipo de vuelo": string;
  "Sala": string;
  "Muelle": string;
  "AEROLÍNEA": string;
  "Tipo aerolínea": string;
  "STD": string;
  "Hora entera": number;
  "FECHA DIA": string;
  "Pasajeros saliendo": number;
  "Semana": number;
  "Mes": number;
  "Día": number;
  "Año": number;
  [key: string]: string | number ; // Firma de indice para permitir acceso por cadena
}
