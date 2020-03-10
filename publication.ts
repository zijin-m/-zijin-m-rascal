import { AsyncQueue, queue } from "async";
import Debug from "debug";
import { EventEmitter } from "events";
import { mergeDeepRight } from "ramda";
import { BrokerAsPromisedClass } from "rascal";
import { v4 as uuid } from "uuid";

const debug = Debug("rascal:ProxyPublication");

export default class PublicationProxy {

    private get defaultPushOptions() {
        return {
            options: {
                messageId: uuid()
            }
        };
    }

    private failedQuene: AsyncQueue<any>;

    private messageMap = new Map<string, any>();

    private interval: NodeJS.Timeout | undefined;

    private readonly INTERVAL_PERIOD_SECOND: number = 10;

    private readonly name: string;

    private readonly broker: BrokerAsPromisedClass;

    constructor(name: string, broker: BrokerAsPromisedClass) {
        this.name = name;
        this.broker = broker;
        this.failedQuene = this.createFailedMessageQueue();
        this.pauseQueue();
    }

    public async publish(message: any, overrides?: any) {
        const config = mergeDeepRight(this.defaultPushOptions, overrides || {});
        this.addMessage(config.options.messageId, arguments);
        const emiter = await this.broker.publish(this.name, message, config);
        this.attachPublishHandlers(emiter);
        return emiter;
    }

    public pauseTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    public runTimer() {
        if (!this.interval) {
            this.interval = setInterval(async() => {
                const queueHead = (this.failedQuene as any)._tasks.head;
                if (queueHead) {
                    await this.retryByMessageId(queueHead.data);
                }
            }, this.INTERVAL_PERIOD_SECOND * 1000);
        }
    }

    private pauseQueue() {
        if (!this.failedQuene.paused) {
            this.failedQuene.pause();
            this.runTimer();
        }
    }

    private resumeQueue() {
        if (this.failedQuene.paused) {
            this.pauseTimer();
            this.failedQuene.resume();
        }
    }

    private attachPublishHandlers(publihser: EventEmitter) {
        publihser.on("success", this.onConfirmSuccess.bind(this));
        publihser.on("return", this.onConfirmReturn.bind(this));
        publihser.on("error", this.onConfirmError.bind(this));
    }

    private createFailedMessageQueue() {
        return queue(async(messageId: string, callback: (err?: Error) => void) => {
            try {
                await this.retryByMessageId(messageId);
                callback();
            } catch (error) {
                callback(error);
            }
        }, 1);

    }

    private async retryByMessageId(messageId: string) {
        const args = this.messageMap.get(messageId);
        if (!args) {
            return;
        }
        await this.publish.apply(this, args);
    }

    private queueContains(messageId: string) {
        const tasks: string[] = (this.failedQuene as any)._tasks.toArray();
        return tasks.includes(messageId);
    }

    private pushQueue(messageId: string) {
        if (this.queueContains(messageId)) {
            return;
        }
        this.failedQuene.push(messageId, (err) => {
            if (err) {
                debug("Message retry Error: %s for msgId %s", err.message, messageId);
            }
        });
    }

    private async onConfirmError(error: Error, messageId: string) {
        debug("Message confirm Error: %s for msgId %s", error.message, messageId);
        this.pauseQueue();
        this.pushQueue(messageId);
    }

    private async onConfirmSuccess(messageId: string) {
        debug("Message confirm success: %s", messageId);
        this.delteMessage(messageId);
        this.resumeQueue();
    }

    private async onConfirmReturn(message: any) {
        debug("Message confirm return: %s", message.properties.messageId);
        this.delteMessage(message.properties.messageId);
    }

    private addMessage(messageId: string, message: any) {
        this.messageMap.set(messageId, message);
    }

    private delteMessage(messageId: string) {
        this.messageMap.delete(messageId);
    }
}
