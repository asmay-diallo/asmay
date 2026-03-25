declare module 'redux-persist/integration/react' {
  import { ReactNode } from 'react';
  
  export interface PersistGateProps {
    loading?: ReactNode;
    persistor: any;
    children?: ReactNode;
    onBeforeLift?: () => void;
  }
  
  export class PersistGate extends React.Component<PersistGateProps, any> {}
}