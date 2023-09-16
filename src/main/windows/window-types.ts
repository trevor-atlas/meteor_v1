export interface WindowConfig {
  getAssetPath: (...paths: string[]) => string;
}

export interface CreateWindowsOptions {
  isDebug: boolean;
  installExtensions: () => Promise<void>;
}
