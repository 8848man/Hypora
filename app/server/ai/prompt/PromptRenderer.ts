// Prompt rendering mechanism — owned by AI Application Service per
// sdd/ai/03_ownership_model.md ("Prompt template ... Prompt rendering ... owned by
// AI Application Service, so templates remain portable across providers"). Generic
// and capability-agnostic: it knows nothing about Canvas Assistant or any other
// capability's template content — a Capability supplies its own template string and
// variables; this module only does the mechanical substitution.

export type PromptTemplate = {
  render(variables: Record<string, unknown>): string;
};

export function createTemplate(template: string): PromptTemplate {
  return {
    render(variables: Record<string, unknown>): string {
      return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
        const value = variables[key];
        return value === undefined ? "" : String(value);
      });
    },
  };
}
