export interface tModelBase {
    name: string,
    startup: () => Promise<void>
    shutdown: () => Promise<void>
}