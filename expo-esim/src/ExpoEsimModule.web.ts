import { registerWebModule, NativeModule } from 'expo';

class ExpoEsimModule extends NativeModule<{}> {}

export default registerWebModule(ExpoEsimModule, 'ExpoEsimModule');
