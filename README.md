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
- Header - openflow header type
- Message - generic OpenFlow message type
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
A view can constructed from a `Buffer` object. The buffer may come from a 
socket, file, or memory location. There are no optional construction arguments.
Additionally, a view may be constructed from another view. When decoding certain
types of protocols it is often necessary to artificially constrain the protocol
deserializers view of the input data. This can be achieved in two ways through:
advance, or constrain. Both operations return a new view over a restricted
subset of the existing Buffer object. Advance will advance the head pointer by
the indicated number of bytes, while constrain will reduce the tail pointer to
be the indicated number of bytes from the head.

```
// Construct a new view from a new Buffer
var view = new View(new Buffer(1024));

// Produce a new view without the 8 byte header
var newView = view.advance(8);

// Produce a new view constrained by the indicated payload length
var newView = view.constrain(100);
```

#### Operations
The view is the interface used for serialization/deserialization with a buffer.
The operations provided allow for: serialization and deserialization of unsigned
integer and byte array data types. Additionally, there are a few operations
provided for determining how many bytes are available for additional
serialization/deseriation. Finally, there is an operation `reset` that is useful
for testing. It allows for serializations to a view, reseting the offset
pointer, and then deserializing from the same view.

```
// Reset the offset pointer to be equal to the head
view.reset();

// Determine if enough bytes remain from `tail - offset` 
if(view.available() < 8) { ...

// Determine how many bytes used from `offset - head`
view.consumed()

// Deserialize a 1 byte unsigned integer
var version = view.readUInt8();

// Deserialize a 2 byte, MSBF, unsigned integer
var length  = view.readUInt16();

// Deserialize a 4 byte, MSBF, unsigned integer
var xid     = view.readUInt32();

// Deserialize a byte array from using all remaining buffer space
var data    = view.read();

// Deserialize a 32 element byte array
var name    = view.read(32);

// Serialize a 1 byte unsigned integer
view.writeUInt8(type);

// Serialize a 2 byte unsigned integer
view.writeUInt16(length);

// Serialize a 4 byte unsigned integer
view.writeUInt32(xid);

// Serialize a byte array
view.write(buffer);
```

### Header

#### Construction

#### Operations

### Message

#### Construction

#### Operations

### Data

#### Construction

#### Operations


