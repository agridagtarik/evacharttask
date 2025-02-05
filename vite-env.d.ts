
/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />


interface ImportMetaEnv {
  readonly VITE_BASE_API_URL: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


declare module '*.vue' {

  import { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;

  export default component;

}
