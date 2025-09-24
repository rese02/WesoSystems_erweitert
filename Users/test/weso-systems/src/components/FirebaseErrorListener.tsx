'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase/client';

const FirebaseErrorListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = async (error: FirestorePermissionError) => {
      console.error('Caught Firestore Permission Error:', error);

      try {
        const auth = clientAuth;
        const user = auth.currentUser;
        let tokenResult = null;
        if (user) {
          tokenResult = await user.getIdTokenResult();
        }

        const contextualError = new Error(
          `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(
            {
              auth: user
                ? {
                    uid: user.uid,
                    token: tokenResult?.claims,
                  }
                : null,
              method: error.context.operation,
              path: `/databases/(default)/documents/${error.context.path}`,
              request: {
                resource: {
                  data: error.context.requestResourceData,
                },
              },
            },
            null,
            2
          )}`
        );

        // This will be caught by the Next.js development overlay
        throw contextualError;
      } catch (e) {
        // Fallback for any errors during detailed error creation
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
};

export default FirebaseErrorListener;
