import { HODToolConfig } from './hod-ai.types';

export class HODToolRegistry {
  private tools: Map<string, HODToolConfig> = new Map();

  registerTool(config: HODToolConfig) {
    if (this.tools.has(config.name)) {
      throw new Error(`Tool ${config.name} is already registered.`);
    }
    this.tools.set(config.name, config);
  }

  getTool(name: string): HODToolConfig | undefined {
    return this.tools.get(name);
  }

  getAllTools(): HODToolConfig[] {
    return Array.from(this.tools.values());
  }
}

export const hodToolRegistry = new HODToolRegistry();
