export function assessRisk({ bp, sugar, temperature }) {
  const messages = [];
  // parse BP like "120/80" or "120/80 mmHg"
  if (bp) {
    const parts = bp.split("/").map((v) => parseInt(v, 10));
    if (parts.length >= 2) {
      const [sys, dia] = parts;
      if (!isNaN(sys) && sys >= 140) messages.push("Hypertension risk");
      if (!isNaN(dia) && dia >= 90) messages.push("Hypertension risk");
    }
  }
  if (sugar) {
    const num = parseInt(sugar.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num >= 140) messages.push("High sugar");
  }
  if (temperature) {
    const tempNum = parseFloat(temperature);
    if (!isNaN(tempNum) && tempNum > 101) messages.push("Fever alert");
  }
  return messages;
}
