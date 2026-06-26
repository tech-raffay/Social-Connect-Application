// Web mock for @react-native-firebase/* modules.
// Returns a callable that throws, triggering the service
// layer to fall back to AsyncStorage mock mode.

const createMock = () => {
  const handler = () => {
    throw new Error('Firebase native modules are not available on web.');
  };
  // Make the default export callable (e.g. auth(), firestore(), storage())
  // and also support property access like auth().currentUser
  handler.currentUser = null;
  handler.FieldValue = {
    serverTimestamp: () => new Date().toISOString(),
    increment: (n) => n,
  };
  return handler;
};

export default createMock();
