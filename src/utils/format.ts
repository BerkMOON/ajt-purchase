export function filterValues(values: any, filterFields: string[]) {
  const filteredValues = Object.fromEntries(
    Object.entries(values).filter(([key]) => !filterFields.includes(key)),
  );
  return filteredValues;
}
