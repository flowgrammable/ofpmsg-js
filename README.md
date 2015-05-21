# OpenFlow Message Library *js*
This is a library for manipulating OpenFlow messages. It provides basic
facilities for message construction from sockets, files, or user programs. The
library establishes a basic set of patterns for Type Length Value (TLV) message
layer composition based on the paper [Eliminating Network Protocol
Vulnerabilities throught Abstraction and System Language 
Design](http://arxiv.org/pdf/1311.3336.pdf). This library is useful for anyone
wanting to quickly build OpenFlow based tools: testers, decoders, packet
generators, controllers, or switch-agents.

### Sample Usage
```
```

### Development Setup
- Prerequisites:
    - Install Node or IO.js
    - Install Grunt globally - ```sudo npm install -g grunt-cli```
- Dependencies:
    - Install local dependencies - ```npm install```
- Tests:
    - Execute unit tests - ```grunt```

## Types Supported
- Message - generic OpenFlow message type
- Header - openflow header type
- View - memory abstraction for serialization/deserialization
- Data - wrapper for arbitrary uninterpreted data
- *Payloads* - version specific OpenFlow payload types

## Operations Supported
- one
- two

## Functions Supported
- one
- two

## Exceptions Generated
- one
- two

