# @zijin-m/Rascal

@zijin-m/Rascal wrapper for [rascal](https://www.npmjs.com/package/rascal) to support default publication, subscription handlers, auto republish message when confirm failed, auto ackOrNack when no error emit form your handler. 

[![NPM version](https://img.shields.io/npm/v/@zijin-m/rascal.svg?style=flat-square)](https://www.npmjs.com/package/@zijin-m/rascal)
[![NPM downloads](https://img.shields.io/npm/dm/@zijin-m/rascal.svg?style=flat-square)](https://www.npmjs.com/package/@zijin-m/rascal)
[![Build Status](https://img.shields.io/travis/guidesmiths/@zijin-m/rascal/master.svg)](https://travis-ci.org/guidesmiths/@zijin-m/rascal)
[![Code Climate](https://codeclimate.com/github/guidesmiths/@zijin-m/rascal/badges/gpa.svg)](https://codeclimate.com/github/guidesmiths/@zijin-m/rascal)
[![Test Coverage](https://codeclimate.com/github/guidesmiths/@zijin-m/rascal/badges/coverage.svg)](https://codeclimate.com/github/guidesmiths/@zijin-m/rascal/coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)
[![Dependency Status](https://david-dm.org/guidesmiths/@zijin-m/rascal.svg)](https://david-dm.org/guidesmiths/@zijin-m/rascal)
[![devDependencies Status](https://david-dm.org/guidesmiths/@zijin-m/rascal/dev-status.svg)](https://david-dm.org/guidesmiths/@zijin-m/rascal?type=dev)

# About

Rascal is a rich pub/sub wrapper for the excellent amqplib. One of the best things about Rascal is that make amqplib easier.

This project want to add more default features for rascal that:

* default broker error handler
* default publication event handler for success, return and error
* repulih message when confirm error from rabbitmq
* default subscription event handler for messgae, error and so on
* auto ackOrNack message when no error throw form handler
  
# Examples 

### Publish

```js
import { Broker, Consumer } from "@zijin-m/rascal";
import config from "./config";

const broker = await Broker.create(config)
await broker.publish('order.save', { now: new Date().toLocaleTimeString() 
```

### Subscribe

```js
import { Broker, Consumer } from "@zijin-m/rascal";
import config from "./config";

class JobCousumer extends Consumer {
    async onMessage(content: any) {
        // your code
    }
}

const broker = await Broker.create(config)
await broker.addConsumer(new JobCousumer("order.save"))
```
