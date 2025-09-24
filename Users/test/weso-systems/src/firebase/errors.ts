// Create a new file, e.g., `src/lib/errors.ts`
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  baseError?: Error;

  constructor(context: SecurityRuleContext, baseError?: Error) {
    const message = `Firestore Permission Denied for ${context.operation.toUpperCase()} on ${
      context.path
    }`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.baseError = baseError;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
