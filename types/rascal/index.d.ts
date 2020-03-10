declare module "rascal" {

    import { EventEmitter } from "events";

    class SubscriptionSession extends EventEmitter {

    }

    class BrokerAsPromisedClass extends EventEmitter {
        public readonly config: RascalConfigWithDefault;
        constructor(config: RascalConfig, compoents: any)
        public connect(name: string): Promise<any>;
        public nuke(): Promise<void>;
        public purge(): Promise<void>;
        public shutdown(): Promise<void>;
        public bounce(): Promise<void>;
        public publish(name: string, message: any, overrides?: any): Promise<EventEmitter>;
        public forward(name: string, message: any, overrides?: any): Promise<EventEmitter>;
        public subscribe(name: string, overrides?: any): Promise<SubscriptionSession>;
    }

    export const BrokerAsPromised: {
        create(config: any, components?: any): Promise<BrokerAsPromisedClass>;
    };

    export function withDefaultConfig<T>(config: T): T;

    export interface RascalConfig {
        vhosts: {
            [key: string]: Vhost
        };
        recovery?: {
            [key: string]: Recovery[]
        };
        redeliveries?: {
            counters: {
                [key: string]: Counter
            }
        };
    }

    export interface RascalConfigWithDefault {
        vhosts: {
            [key: string]: Vhost
        };
        publications: {
            [key: string]: Publication
        };
        subscriptions: {
            [key: string]: Subscription
        };
        recovery?: {
            [key: string]: Recovery[]
        };
        redeliveries?: {
            counters: {
                [key: string]: Counter
            }
        };
    }

    interface Vhost {
        namespace? : string;
        name? : string;
        check? : boolean;
        assert? : boolean;
        connection?: Connection;
        exchanges: {
            [key: string]: Exchange
        };
        queues: {
            [key: string]: Queue
        };
        bindings: {
            [key: string]: Binding
        };
        publications: {
            [key: string]: Publication
        };
        subscriptions: {
            [key: string]: Subscription
        };
        [key: string]: any;
    }

    interface Connection {
        protocol?: string;
        hostname?: string;
        port?: number;
        user?: string;
        password?: string;
    }

    interface Exchange {
        assert?: boolean;
        check?: boolean;
        type: "direct" | "fanout" | "topic" | "header";
    }

    interface Queue {
        assert?: boolean;
        check?: boolean;
        options?: {
            arguments: any
        };
    }

    interface Binding {
        source: string;
        bindingKey: string;
        destination: string;
        destinationType: string;
    }

    interface Publication {
        vhost: string;
        exchange: string;
        routingKey: string;
    }

    interface Subscription {
        vhost: string;
        queue: string;
        prefetch?: number;
        recovery?: string;
        redeliveries?: {
            limit: number;
            counter: string;
        };
    }

    interface Recovery {
        strategy: "ack" | "nack" | "republish" | "forward";
        defer?: number;
        attempts?: number;
        requeue?: boolean;
    }

    interface Counter {
        type: "stub" | "inMemory" | "inMemoryCluster";
        size?: number;
    }

}