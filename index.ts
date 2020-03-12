import { BrokerProxy } from "./broker"

import { Consumer, suscribeDecorator } from "./lib"

import { Message } from "amqplib";

export {
    Consumer,
    Message,
    BrokerProxy as Broker,
    suscribeDecorator
}