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
- View - memory abstraction for serialization/deserialization
- Message - generic OpenFlow message type
- Header - openflow header type
- View - memory abstraction for serialization/deserialization
- Data - wrapper for arbitrary uninterpreted data
- *Payloads* - version specific OpenFlow payload types

## Functions Supported
- one
- two

## Exceptions Generated
- one
- two

### View
This type is a simple abstraction that wraps a memory object. In javascript this
is the Buffer type. A view is critical for managing structural constraints and
ensuring we are always operating within safe regions of memory during message
binary based serialization or deserialization.

A view contains a Buffer object and tracks three locations within the buffer:
head, tail, and offset. The head and tail are immutable and point to the
boundaries of the underlying Buffer, while the offset is used as a cursor to
track serialization/deserialization progress through the Buffer. Read or write
operations against the view will advance the offset by the amount of bytes read
or written. All read/write operations assume a Most Significant Byte First
(MSBF) layer within memory.

#### Construction
A view is constructed from a `Buffer` object. The buffer may come from a socket,
file, or memory location. There are no optional construction arguments.

```
// Construct a new view from a new Buffer
var view = new View(new Buffer(1024));
```

#### Operations

```
var newView = view.advance(8);
var newView = view.constrain(100);

view.reset();

if(view.available() < 8) { ...
if(view.consumed() < 100) { ...

var version = view.readUInt8();
var length  = view.readUInt16();
var xid     = view.readUInt32();
var data    = view.read();
var name    = view.read(32);

view.writeUInt8(type);
view.writeUInt16(length);
view.writeUInt32(xid);
view.write(buffer);
```

#### Construction

#### Operations

### Header

#### Construction

#### Operations

### Message

#### Construction

#### Operations

### Data

#### Construction

#### Operations


