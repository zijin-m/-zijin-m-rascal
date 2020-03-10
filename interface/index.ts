import { BrokerAsPromisedClass, SubscriptionSession } from "rascal";
import { Message } from "amqplib";

export interface AckRecovery {
    strategy: "ack" | "nack" | "republish" | "forward";
    defer?: number;
    attempts?: number;
    requeue?: boolean;
}

export interface SubScriptionConfig {
    name: string;
    broker: BrokerAsPromisedClass;
    overrides?: any;
}

export type AckOrNackFn = (err?: Error, recovery?: AckRecovery | AckRecovery[]) => void;

export abstract class Consumer {
    public readonly name: string;
    public readonly overrides: any;
    constructor(name: string, overrides?: any) {
        this.name = name;
        this.overrides = overrides;
    }
    public abstract onMessage(content: any, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public onInvalidContent?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public onRedeliveriesError?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public onRedeliveriesExceeded?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public onError?(err: Error): Promise<void>;
    public onConsumerCancel?(err: Error): Promise<void>;
}

