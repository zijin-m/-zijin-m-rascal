import { BrokerProxy } from "./broker"

import { Consumer, subscribeDecorator } from "./lib"

import { Message } from "amqplib";

export {
    Consumer,
    Message,
    BrokerProxy as Broker,
    subscribeDecorator
}