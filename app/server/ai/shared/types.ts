// Shared Request/Response Contract building blocks, reused identically across
// every AI Capability's own contract (sdd/ai/03_ownership_model.md's Context
// Representation Pipeline: every capability reads Normalized Workspace Context
// via this same shape). A single canonical declaration avoids six capability
// `types.ts` files redeclaring the identical type.

export type CanvasContextField = {
  field: string;
  value: string;
};
