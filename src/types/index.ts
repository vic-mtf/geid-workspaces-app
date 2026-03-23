import { Theme } from "@mui/material";

// Extend MUI theme with custom options
declare module "@mui/material/styles" {
  interface Theme {
    customOptions: {
      opacity: string;
      blur: string;
    };
  }
  interface ThemeOptions {
    customOptions?: {
      opacity?: string;
      blur?: string;
    };
  }
}

// Redux state types
export interface AppSliceState {
  mode: "light" | "dark" | "auto";
  lang: string;
  opacity: number;
  blur: number;
  users: UserProfile[];
  user: string | null;
  stayConnected: boolean;
}

export interface UserSliceState {
  connected: boolean;
  token?: string;
  id?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  email?: string;
  image?: string;
  auth?: UserAuth;
  docTypes?: DocType[];
  [key: string]: any;
}

export interface DataSliceState {
  loaded: boolean;
  documents?: FileItem[];
  images?: FileItem[];
  videos?: FileItem[];
  audios?: FileItem[];
  others?: FileItem[];
  isAllData?: boolean;
  [key: string]: any;
}

export interface RootState {
  app: AppSliceState;
  user: UserSliceState;
  data: DataSliceState;
  ui: import("@/redux/ui").UiSliceState;
}

// User types
export interface UserProfile {
  id?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  fname?: string;
  lname?: string;
  mname?: string;
  email?: string;
  image?: string;
  name?: string;
}

export interface UserAuth {
  name?: string;
  privileges?: AuthPrivilege[];
}

export interface AuthPrivilege {
  app: string;
  [key: string]: any;
}

// Document/File types
export interface FileItem {
  name?: string;
  url?: string;
  type?: string;
  createdAt?: string;
  docType?: string;
  size?: number;
  isDirectory?: boolean;
  [key: string]: any;
}

// Doc type
export interface DocType {
  name: string;
  subtypes?: string[];
}

// App config type
export interface AppConfig {
  version: string;
  lang: string;
  colors: {
    main: string;
    primary: {
      mode: "light" | "dark" | "auto";
      light: ColorScheme;
      dark: ColorScheme;
      auto: ColorScheme;
    };
  };
}

export interface ColorScheme {
  main: string;
  paper: string;
  [key: string]: string;
}

// File extension base type
export interface FileExtensionInfo {
  exts: string[];
  icon: string;
  type: string;
  docType: string;
}

// Navigation option type
export interface NavOption {
  icon: React.ElementType;
  label: string;
  to: string;
}

// Apps list type
export interface AppItem {
  name: string;
  src: string;
  href?: string;
  permissions?: string[];
  component?: React.ElementType;
}

// Action option type
export interface ActionOption {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (args: ActionClickArgs) => void;
  options?: SubActionOption[];
}

export interface SubActionOption {
  label: string;
  disabled?: boolean;
  onClick?: (file: FileItem) => void;
}

export interface ActionClickArgs extends FileItem {
  enqueueSnackbar?: any;
  closeSnackbar?: any;
  refresh?: any;
  loading?: boolean;
  user?: UserSliceState;
  setIsRemoved?: (val: boolean) => void;
}

// Export theme type alias
export type { Theme };
