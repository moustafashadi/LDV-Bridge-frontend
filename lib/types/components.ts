// ============================================
// COMPONENT MANAGEMENT TYPES (Task 10)
// ============================================
// These types match the backend DTOs exactly

export enum ComponentType {
  SCREEN = 'SCREEN',
  FORM = 'FORM',
  GALLERY = 'GALLERY',
  DATA_TABLE = 'DATA_TABLE',
  BUTTON = 'BUTTON',
  INPUT = 'INPUT',
  DROPDOWN = 'DROPDOWN',
  CUSTOM = 'CUSTOM',
  MICROFLOW = 'MICROFLOW', // Mendix
  NANOFLOW = 'NANOFLOW',   // Mendix
  PAGE = 'PAGE',           // Mendix
  SNIPPET = 'SNIPPET',     // Mendix
  LAYOUT = 'LAYOUT',       // Mendix
}

export interface Component {
  id: string;
  name: string;
  description?: string;
  type: ComponentType;
  platform: 'PowerApps' | 'Mendix';
  appId?: string;
  appName?: string;
  organizationId: string;
  metadata: Record<string, any>;
  properties?: Record<string, any>;
  isReusable: boolean;
  usageCount: number;
  version: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: number;
  metadata: Record<string, any>;
  properties?: Record<string, any>;
  changedBy: string;
  changeDescription?: string;
  createdAt: string;
}

export interface CreateComponentDto {
  name: string;
  description?: string;
  type: ComponentType;
  platform: 'PowerApps' | 'Mendix';
  appId?: string;
  metadata: Record<string, any>;
  properties?: Record<string, any>;
  isReusable?: boolean;
}

export interface UpdateComponentDto {
  name?: string;
  description?: string;
  type?: ComponentType;
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
  isReusable?: boolean;
}

export interface ExtractComponentsDto {
  appId: string;
  componentTypes?: ComponentType[];
  includeNested?: boolean;
}

export interface ExtractComponentsResponse {
  success: boolean;
  message: string;
  componentsExtracted: number;
  components: Component[];
}

export interface PaginatedComponentsResponse {
  data: Component[];
  total: number;
  page: number;
  limit: number;
}

export interface ComponentFilters {
  type?: ComponentType;
  platform?: 'PowerApps' | 'Mendix';
  appId?: string;
  isReusable?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ComponentWithVersions extends Component {
  versions: ComponentVersion[];
}
