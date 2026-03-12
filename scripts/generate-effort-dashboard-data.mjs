import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/19CwKD7iEUMtXedpSOCJu4ue4OELRTtrgj_qHElZ3uIo/export?format=csv";
const EDIT_URL =
  "https://docs.google.com/spreadsheets/d/19CwKD7iEUMtXedpSOCJu4ue4OELRTtrgj_qHElZ3uIo/edit?usp=sharing";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === "\"") {
        if (text[index + 1] === "\"") {
          value += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }

      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function parseDate(value) {
  const [day, month, year] = value.split("/").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function parseCompetence(value) {
  const match = value.match(/^(\d{4})\s*-\s*(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month] = match;
  const monthNumber = Number(month);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return `${year} - ${month}`;
}

function parseDuration(start, end) {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);

  if (startParts.length < 2 || endParts.length < 2 || [...startParts, ...endParts].some(Number.isNaN)) {
    return { minutes: null, reason: "invalid_time" };
  }

  const [startHour, startMinute] = startParts;
  const [endHour, endMinute] = endParts;
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  if (endTotal < startTotal) {
    return { minutes: null, reason: "end_before_start" };
  }

  const minutes = endTotal - startTotal;

  if (minutes > 600) {
    return { minutes: null, reason: "over_ten_hours" };
  }

  return { minutes, reason: null };
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()} - ${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function fetchSheet() {
  const response = await fetch(SHEET_URL, {
    headers: {
      "user-agent": "codex-profitability-dashboard",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao baixar a planilha: ${response.status}`);
  }

  return response.text();
}

function buildSnapshot(csv) {
  const [, ...rows] = parseCsv(csv);
  const discarded = {
    endBeforeStart: 0,
    invalidTime: 0,
    missingFields: 0,
    overTenHours: 0,
  };
  const validRows = [];
  const futureCompetenceKeys = new Set();
  const currentCompetenceKey = currentMonthKey();

  rows.forEach((row) => {
    const client = (row[1] ?? "").trim();
    const activity = (row[2] ?? "").trim();
    const area = (row[3] ?? "").trim();
    const collaborator = (row[4] ?? "").trim();
    const workDate = parseDate((row[5] ?? "").trim());
    const competence = parseCompetence((row[6] ?? "").trim());
    const start = (row[7] ?? "").trim();
    const end = (row[8] ?? "").trim();
    const notes = (row[9] ?? "").trim();
    const timestamp = (row[0] ?? "").trim();
    const duration = parseDuration(start, end);

    if (!client || !activity || !area || !collaborator || !workDate || !competence || duration.minutes === null) {
      if (duration.reason === "end_before_start") {
        discarded.endBeforeStart += 1;
      } else if (duration.reason === "over_ten_hours") {
        discarded.overTenHours += 1;
      } else if (duration.reason === "invalid_time") {
        discarded.invalidTime += 1;
      } else {
        discarded.missingFields += 1;
      }

      return;
    }

    if (competence > currentCompetenceKey) {
      futureCompetenceKeys.add(competence);
    }

    validRows.push({
      activity,
      area,
      client,
      collaborator,
      competence,
      date: workDate,
      isFutureCompetence: competence > currentCompetenceKey,
      isInternal: client.toUpperCase() === "NUNES CONTABILIDADE",
      minutes: duration.minutes,
      notes,
      timestamp,
    });
  });

  return {
    defaultSheetUrl: EDIT_URL,
    discarded,
    futureCompetenceKeys: [...futureCompetenceKeys].sort(),
    generatedAt: new Date().toISOString(),
    rows: validRows,
    rowCount: rows.length,
    validRowCount: validRows.length,
  };
}

async function main() {
  const csv = await fetchSheet();
  const snapshot = buildSnapshot(csv);
  const outputPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "standalone-effort-dashboard",
    "data.js",
  );

  await writeFile(outputPath, `window.timesheetSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`, "utf8");
  console.log(`Dados gerados em ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
