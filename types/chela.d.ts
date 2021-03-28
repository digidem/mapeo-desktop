declare module 'chela' {
  /**
   * Terminate a Node.js Process (and all Child Processes) based on the Process ID
   */
  function mod (
    filepath: string,
    permissions: string,
    callback: (error: NodeJS.ErrnoException, modified: string[]) => void
  ): void
}
