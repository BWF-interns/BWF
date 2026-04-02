export function generateStudendID(index: number): string {
  const year = new Date().getFullYear();
  const id = String(index).padStart(3, "0");
  return `BWF-${year}-${id}`;
}
