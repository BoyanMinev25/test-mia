class Logger {
  static log(...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV]', ...args)
    }
  }

  static error(...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ERROR]', ...args)
    }
    // TODO: Integrate with error reporting service (Sentry, etc.)
  }
}

export default Logger 