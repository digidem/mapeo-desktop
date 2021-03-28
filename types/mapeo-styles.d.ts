declare module 'mapeo-styles' {
  /**
   * Unpacks the styles/ and presets/ directories to the file path root. A
   * version file will also be written to track what version of the style/preset
   * data was unpacked. This lets the unpacking step be nearly zero-cost when
   * the version of the data has not been changed.
   */
  function unpackIfNew (
    root: string,
    callback: (error: NodeJS.ErrnoException, newSettings: boolean) => void
  ): void

  export const FALLBACK_DIR_NAME: string
}
