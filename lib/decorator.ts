/**
 * set class.name by decorator
 * @param name subscription name
 */
export function subscribeDecorator(name: string) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        return class extends constructor {
            name = name;
        }
    }
}