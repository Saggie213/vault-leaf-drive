/**
 * Normalizes backend errors into user-friendly English messages
 */
export function normalizeError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Connection/initialization errors - distinguish from query failures
  if (errorMessage.includes('Connection not ready')) {
    return 'Connection not ready. Please wait a moment and try again';
  }

  if (errorMessage.includes('Actor not available')) {
    return 'Connection not ready. Please wait a moment and try again';
  }

  // Authorization and profile setup errors
  if (errorMessage.includes('Unauthorized')) {
    if (errorMessage.includes('sign up') || errorMessage.includes('Please sign up first')) {
      return 'Please complete your profile setup to access your drive';
    }
    if (errorMessage.includes('sign in') || errorMessage.includes('Not signed in')) {
      return 'Please sign in to access your drive';
    }
    if (errorMessage.includes('admin')) {
      return 'You do not have permission to perform this action';
    }
    if (errorMessage.includes('Only users')) {
      return 'Please sign in to continue';
    }
    return 'You do not have permission to access this content';
  }

  // Not found errors
  if (errorMessage.includes('not found')) {
    if (errorMessage.includes('Folder')) {
      return 'The folder could not be found';
    }
    if (errorMessage.includes('File')) {
      return 'The file could not be found';
    }
    return 'The requested item could not be found';
  }

  // Duplicate errors
  if (errorMessage.includes('already exists')) {
    return 'An item with this name already exists';
  }

  // System initialization
  if (errorMessage.includes('System initialized')) {
    return 'System is being initialized. Please refresh the page';
  }

  // Return the original message if it's already user-friendly
  if (errorMessage.length < 100 && !errorMessage.includes('trap') && !errorMessage.includes('Debug')) {
    return errorMessage;
  }

  // Generic fallback
  return 'An error occurred. Please try again';
}

/**
 * Checks if an error is related to authorization or profile setup
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('sign up') ||
    errorMessage.includes('sign in') ||
    errorMessage.includes('Not signed in')
  );
}

/**
 * Checks if an error is a transient connection/initialization issue
 */
export function isConnectionError(error: unknown): boolean {
  if (!error) return false;
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('Connection not ready') ||
    errorMessage.includes('Actor not available')
  );
}
