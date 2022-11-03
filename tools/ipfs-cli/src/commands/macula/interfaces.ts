/* eslint-disable @typescript-eslint/no-explicit-any */
export type AvailableCompressions = 'br' | 'gz';
export interface IMaculaConfig {
  version: 1;
  source: 'sveltekit';
  account: string;
  preredered: boolean;
  appType: 'spa' | 'static';
  fallback?: {
    file?: string;
    route?: string;
  };
  compressedFor: AvailableCompressions[];
  routes: any[];
  pages: Record<string, { file: string }>;
  subdomain?: string;
}
