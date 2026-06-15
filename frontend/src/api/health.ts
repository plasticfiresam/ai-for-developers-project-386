import { request } from './client';
import type { HealthResponse } from './types';

export const healthApi = {
  check(): Promise<HealthResponse> {
    return request('/health');
  },
};
