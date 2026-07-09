// Context transformation mechanism — owned by AI Application Service per
// sdd/ai/03_ownership_model.md ("Context transformation ... mechanical
// truncation/serialization to fit a provider's token budget or format ... owned by
// AI Application Service"). Generic: takes a list of already-selected context items
// (selection itself is a Feature/Capability-caller concern, not this module's) and
// serializes/bounds them. No Capability-specific field names are known here.

export type ContextItem = {
  field: string;
  value: string;
};

const DEFAULT_MAX_LENGTH = 2000;

export function serializeContext(items: ContextItem[], maxLength: number = DEFAULT_MAX_LENGTH): string {
  const serialized = items.map((item) => `${item.field}: ${item.value}`).join("\n");
  return serialized.length > maxLength ? serialized.slice(0, maxLength) : serialized;
}
