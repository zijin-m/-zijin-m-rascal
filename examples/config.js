module.exports = {
    vhosts: {
        "/": {
            connection: {
                protocol: "amqp",
                hostname: "127.0.0.1",
                port: 5672,
                user: "guest",
                password: "guest",
            },
            queues: {
                "order.save.service_b": {
                    assert: true
                },
            },
            exchanges: {
                order: {
                    type: "direct",
                    assert: true
                }
            },
            bindings: {
                "order.save.service_b": {
                    source: "order",
                    bindingKey: "save",
                    destination: "order.save.service_b",
                    destinationType: "queue"
                },
            },
            publications: {
                "order.save": {
                    vhost: "/",
                    exchange: "order",
                    routingKey: "save"
                },
            },
            subscriptions: {
                "order.save": {
                    queue: "order.save.service_b",
                    prefetch: 1,
                    vhost: "/",
                    recovery: "deferred_retry",
                    redeliveries: {
                        limit: 3,
                        counter: "shared"
                    }
                },
            }
        }
    },
    recovery: {
        deferred_retry: [
            {
                strategy: "nack",
                requeue: true,
                defer: 10 * 1000
            }
        ]
    },
    redeliveries: {
        counters: {
            shared: {
                type: "inMemory",
            }
        }
    }
};
