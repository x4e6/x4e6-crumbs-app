export const config = {
  // If you publish a sheet as CSV, paste URL here.
  // Example:
  // https://docs.google.com/spreadsheets/d/e/<...>/pub?gid=1705221888&single=true&output=csv
  // Current source (provided by user):
  SHEET_CSV_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZbI7raXyPjMm4Zehw91ytEp2EKQrCTxfXzNX6mMxtxAoHzVE26Foev3CsXduZcw/pub?output=csv",
  // GID of the "Описание" tab in the same published spreadsheet (optional).
  // If set, the app will load intro cards from that tab.
  DESCRIPTION_GID: "",
  // Optional: if your published CSV is slow/unavailable, the app falls back to sample data.
};

