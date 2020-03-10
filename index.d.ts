declare module 'publication' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { BrokerAsPromisedClass } from 'rascal';
	export default class PublicationProxy {
	    private get defaultPushOptions();
	    private failedQuene;
	    private messageMap;
	    private interval;
	    private readonly INTERVAL_PERIOD_SECOND;
	    private readonly name;
	    private readonly broker;
	    constructor(name: string, broker: BrokerAsPromisedClass);
	    publish(message: any, overrides?: any): Promise<EventEmitter>;
	    pauseTimer(): void;
	    runTimer(): void;
	    private pauseQueue;
	    private resumeQueue;
	    private attachPublishHandlers;
	    private createFailedMessageQueue;
	    private retryByMessageId;
	    private queueContains;
	    private pushQueue;
	    private onConfirmError;
	    private onConfirmSuccess;
	    private onConfirmReturn;
	    private addMessage;
	    private delteMessage;
	}

}
declare module 'lib/consumer' {
	import { AckOrNackFn } from 'rascal';
	import { Message } from 'amqplib';
	export class Consumer {
	    readonly name: string;
	    readonly overrides: any;
	    constructor(name: string, overrides?: any);
	    onMessage(content: any, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onInvalidContent?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onRedeliveriesError?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onRedeliveriesExceeded?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onError?(err: Error): Promise<void>;
	    onConsumerCancel?(err: Error): Promise<void>;
	}

}
declare module 'subscription' {
	import { Message } from 'amqplib';
	import { BrokerAsPromisedClass, SubscriptionSession, AckOrNackFn } from 'rascal';
	import { Consumer } from 'lib/consumer';
	export default class SubScription {
	    readonly consumer: Consumer;
	    private session;
	    private readonly broker;
	    constructor(consumer: Consumer, broker: BrokerAsPromisedClass);
	    subscribe(): Promise<SubscriptionSession>;
	    messageHandler(message: Message, content: any, ackOrNack: AckOrNackFn): Promise<void>;
	    onInvalidContent(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onRedeliveriesError(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onRedeliveriesExceeded(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
	    onError(err: Error): Promise<void>;
	    onConsumerCancel(err: Error): Promise<void>;
	    private getRecovery;
	    private attachSessionHandlers;
	}

}
declare module 'broker' {
	/// <reference types="node" />
	/// <reference types="rascal" />
	import { Consumer } from 'lib/consumer';
	export class BrokerProxy {
	    static create(config: any, components?: any): Promise<BrokerProxy>;
	    private static instance;
	    private config;
	    private components;
	    private broker;
	    private publications;
	    private subScriptions;
	    private constructor();
	    connect(name: string): Promise<any>;
	    nuke(): Promise<void>;
	    purge(): Promise<void>;
	    shutdown(): Promise<void>;
	    bounce(): Promise<void>;
	    publish(name: string, message: any, overrides?: any): Promise<import("events").EventEmitter>;
	    addConsumer(consumer: Consumer): Promise<import("rascal").SubscriptionSession>;
	    private getPublication;
	    private getSubScription;
	    private init;
	    private attachBrokerHandlers;
	    private onBrokerError;
	    private onBrokerConnect;
	    private onBrokerDisconnect;
	    private runAllTimer;
	    private stopAllTimer;
	}

}
declare module 'config' {
	import { RascalConfig } from 'rascal'; const config: RascalConfig;
	export default config;

}
declare module 'index' {
	import { BrokerProxy } from 'broker';
	import { Consumer } from 'lib/consumer';
	export { Consumer, BrokerProxy as Broker };

}
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


    export type AckOrNackFn = (err?: Error, recovery?: Recovery | Recovery[]) => void;

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
        namespace?: string;
        name?: string;
        check?: boolean;
        assert?: boolean;
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