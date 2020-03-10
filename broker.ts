import Debug from "debug";
import { BrokerAsPromised, BrokerAsPromisedClass, withDefaultConfig } from "rascal";
import Publication from "./publication";
import SubScription from "./subscription";
import { Consumer } from "./interface";

const debug = Debug("rascal:ProxyBroker");

export default class BrokerProxy {

    public static async create(config: any, components?: any) {
        if (!this.instance) {
            this.instance = new BrokerProxy(config, components || {});
            await this.instance.init();
        }
        return this.instance;
    }

    private static instance: BrokerProxy;

    private config: any;

    private components: any;

    private broker: BrokerAsPromisedClass;

    private publications = new Map<string, Publication>();

    private subScriptions = new Map<string, SubScription>();

    private constructor(config: any, components?: any) {
        this.config = config;
        this.components = components;
    }

    public async connect(name: string) {
        return this.broker.connect(name);
    }

    public async nuke() {
        return this.broker.nuke();
    }

    public async purge() {
        return this.broker.purge();
    }

    public async shutdown() {
        return this.broker.shutdown();
    }

    public async bounce() {
        return this.broker.bounce();
    }

    public async publish(name: string, message: any, overrides?: any) {
        return this.getPublication(name).publish(message, overrides);
    }

    public async addConsumer(consumer: Consumer) {
        const subscription = await this.getSubScription(consumer);
        return subscription.subscribe();
    }

    private getPublication(name: string) {
        let publication = this.publications.get(name);
        if (!publication) {
            publication = new Publication(name, this.broker);
            this.publications.set(name, publication);
        }
        return publication;
    }

    private async getSubScription(consumer: Consumer) {
        let subScription = this.subScriptions.get(consumer.name);
        if (!subScription) {
            subScription = new SubScription(consumer, this.broker);
            this.subScriptions.set(consumer.name, subScription);
        }
        return subScription;
    }

    private async init() {
        this.broker = await BrokerAsPromised.create(withDefaultConfig(this.config), this.components);
        this.attachBrokerHandlers();
    }

    private attachBrokerHandlers() {
        this.broker.on("error", this.onBrokerError.bind(this));
        this.broker.on("connect", this.onBrokerConnect.bind(this));
        this.broker.on("disconnect", this.onBrokerDisconnect.bind(this));
    }

    private async onBrokerError(err: Error) {
        debug("Broker Error: %s", err.message);
        this.stopAllTimer();
    }

    private async onBrokerConnect() {
        this.runAllTimer();
    }

    private async onBrokerDisconnect() {
        this.stopAllTimer();
    }

    private runAllTimer() {
        for (const publication of this.publications.values()) {
            publication.runTimer();
        }
    }

    private stopAllTimer() {
        for (const publication of this.publications.values()) {
            publication.pauseTimer();
        }
    }
}
