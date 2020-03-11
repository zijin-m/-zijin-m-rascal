import { AckOrNackFn } from "rascal";
import { Message } from "amqplib";

export class Consumer {
    public readonly name: string;
    public readonly overrides: any;
    /**
     * create Consumer to receive message
     * @param name subscription name
     * @param overrides overrides
     */
    constructor(name: string, overrides?: any) {
        this.name = name;
        this.overrides = overrides;
    }
    public async onMessage(content: any, message: Message, ackOrNack: AckOrNackFn): Promise<void> {
        throw new Error('not impletements')
    }
    public async onInvalidContent?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public async onRedeliveriesError?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public async onRedeliveriesExceeded?(err: Error, message: Message, ackOrNack: AckOrNackFn): Promise<void>;
    public async onError?(err: Error): Promise<void>;
    public async onConsumerCancel?(err: Error): Promise<void>;
}

