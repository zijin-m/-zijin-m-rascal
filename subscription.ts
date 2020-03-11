import { Message } from "amqplib";
import Debug from "debug";
import ramda from "ramda";
import { BrokerAsPromisedClass, SubscriptionSession, AckOrNackFn } from "rascal";
import { Consumer } from "./lib/consumer";

const debug = Debug("rascal:ProxySubScription");

export default class SubScription {

    public readonly consumer: Consumer;

    private session: SubscriptionSession;

    private readonly broker: BrokerAsPromisedClass;

    constructor(consumer: Consumer, broker: BrokerAsPromisedClass) {
        this.consumer = consumer;
        this.broker = broker;
    }

    public async subscribe() {
        this.session = await this.broker.subscribe(this.consumer.name, this.consumer.overrides);
        this.attachSessionHandlers();
        return this.session;
    }

    public async messageHandler(message: Message, content: any, ackOrNack: AckOrNackFn) {
        const once = ramda.once(ackOrNack);
        try {
            await this.consumer.onMessage(content, message, once);
            once();
        } catch (error) {
            once(error, this.getRecovery());
        }
    }

    public async onInvalidContent(err: Error, message: Message, ackOrNack: AckOrNackFn) {
        const once = ramda.once(ackOrNack);
        if (this.consumer.onInvalidContent) {
            try {
                await this.consumer.onInvalidContent(err, message, once);
            } catch (error) {
                once(error);
            }
        }
        once(err);
    }

    public async onRedeliveriesError(err: Error, message: Message, ackOrNack: AckOrNackFn) {
        const once = ramda.once(ackOrNack);
        if (this.consumer.onRedeliveriesError) {
            try {
                await this.consumer.onRedeliveriesError(err, message, once);
            } catch (error) {
                once(error);
            }
        }
        once(err);
    }

    public async onRedeliveriesExceeded(err: Error, message: Message, ackOrNack: AckOrNackFn) {
        const once = ramda.once(ackOrNack);
        if (this.consumer.onRedeliveriesExceeded) {
            try {
                await this.consumer.onRedeliveriesExceeded(err, message, once);
            } catch (error) {
                once(error);
            }
        }
        once(err);
    }

    public async onError(err: Error) {
        debug("Subscription error %", err.message);
    }

    public async onConsumerCancel(err: Error) {
        debug("Subscription consumer cancel %", err.message);
    }

    private getRecovery() {
        const consumeRecovery = this.broker.config.subscriptions[this.consumer.name].recovery || "";
        const allRecovery = this.broker.config.recovery || {};
        return allRecovery[consumeRecovery] || [];
    }

    private attachSessionHandlers() {
        this.session.on("message", this.messageHandler.bind(this));
        this.session.on("error", this.onError.bind(this));
        this.session.on("invalid_content", this.onInvalidContent.bind(this));
        this.session.on("redeliveries_error", this.onRedeliveriesError.bind(this));
        this.session.on("redeliveries_exceeded", this.onRedeliveriesExceeded.bind(this));
        this.session.on("cancelled", this.onConsumerCancel.bind(this));
    }

}
