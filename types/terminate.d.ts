declare module 'terminate' {
  /**
   * Terminate a Node.js Process (and all Child Processes) based on the Process ID
   */
  function terminate (
    pid: number,
    callback: (error: NodeJS.ErrnoException) => void
  ): void
  export = terminate
}
