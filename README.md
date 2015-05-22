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
- Data - wrapper for arbitrary uninterpreted data
- *Payloads* - version specific OpenFlow payload types

## Functions Supported
- header.bytes() - return the size in bytes of a header
- util.makePayload(Class, type, Base) - builds OpenFlow payload types
- util.makeIndex(Type) - builds an object map from header.type to payload Type
- util.fromView(Type, view) - constructs a Type, calls fromView and returns obj
- util.Variant(Index) - builds a variant transformer given a type-Type map

## Exceptions Generated
- Available
- Undefined

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
The OpenFlow header does not change across versions of the protocol. A header
includes a version (uint8), type (uint8), length (uint16), and transaction id 
(uint32). All multi-byte unsigned integers are in Most Significant Byte First
(MSBF) order. A header's length indicates the number of bytes in an OpenFlow
message with is inclusive of the header and the message payload. A valid header
must have a length field with at least 8 bytes.

#### Construction
There are two ways of constructing a header: from terms by a programmer, or
through deserialization of a view.

```
// Construct a default state header and deserialize
var hdr = Header();
hdr.fromView(view);

// Construct a header given named terms
var hdr = Header({
  version: 1,
  type: 1,
  length: 8,
  xid: 1
});
 
// Construct a header from a view
var hdr = fromView(view);
```

#### Operations
Header operations support: serilaization, deserialization, validity checking,
and string representation.

```
// Determine if the header is valid (length >= bytes of the header)
if(hdr.isValid()) { ...

// Determine how many bytes the header consumes in a view
if(view.available() < hdr.bytes()) { ...

// Deserialize a view into a header
hdr.fromView(view);

// Serilaize a header into a view
hdr.toView(view);

// Print a string representaiton of the header
console.log(hdr.toString());
```

#### Functions
The header module only exports one function, which returns the number of bytes
required by a header for serialization/deserialization. This is a constant
expression as the header is a fixed block of fields.

```
// Determine if the view has enough space for a Header
if(view.available() < bytes()) { ...
```

### Message
This is a generic encapsulation for any OpenFlow message. It includes a header
an payload property, where the header is constant regardless of verison of
OpenFlow but the payload varies according to version.

#### Construction
The constrution interfaces supplied are fairly flexible. A user can just supply
payloads and headers will be automatically constructed. Or the user can supply
headers and payloads in construction. Construction from views is possible in a
restricted and unrestricted fashion. You can construct from a view to any
version supported by the library, or indicate that construction should be
limited to a particular protocol

```
// Construct a message with the supplied payload, determine the header
var msg = Message({
  payload: ofp1_0.Hello()
});

// Construct a message with the supplied header and payload
var msg = Message({
  header:  hdr.Header(...),
  payload: ofp1_0.Hello()
});

// construct a default message and then deserialize from a view
var msg = Message();
msg.fromView(view);

// Construct a default message, deserialize from a view, but restrict payload
// type construction to OpenFlow 1.0
var msg = Message();
msg.fromView(view, 1);

// Construct a message from a view
var msg = fromView(view);

// Construct a message from a view, but restrict construction to OpenFlow 1.0
var msg = fromView(view, 1);
```

#### Operations
The operations provided are limited to supporting serialization/deserialization.

```
// Determine the current size in bytes of a message
if(view.available() < msg.bytes()) {
  throw 'Not enough bytes in view';
}
// Serialize the message to the view
msg.toView(view);

```

### Data
The Data type is a simple base class for message payloads that wish to carry
uninterpreted data. A typical pattern in OpenFlow payload types is to allow for
arbitrary byte arrays to postfix any payload type. This mechanisms allows for a
standard way of passing non-standard data in almost any message type. Several
OpenFlow message types will inherit from this type. Uninterpreted data is stored
as a byte array usign the `Buffer` type.

#### Construction
Data can be constructed explicitly for sending and recieving uninterpreted byte
arrays. Most payload types that use the `Data` type will inherit from `Data` and
call the super toView/fromView at the end of their toView/fromView
implementations.

```
// Construct an empty data set
var data = new Data();

// Construct a data set from a utf8 encoding of a string
var data = new Data('asdfasdfasdf');

// Construct a data set from a Buffer
var data = new Data(new Buffer(100));
```

#### Operations
This type only exposed a few operations for: determining byte size,
serizliation, and deserialization.

```
// Determine if enough bytes are available to serialize the data set
if(view.available() < data.bytes()) { ...

// Deserialize a data set from a view
data.fromView(view);

// Serialize a data set to a view
data.toView(view);
```

### Functions

#### makePayload(Class, type, Base)
All OpenFlow payload types must have their OpenFlow header type value associated
with their object definition. Some OpenFlow payloads allow for uninterpreted
data to postfix the payload values, which allows for a standard way of passing
non-standard data in any message sequence. The `Data` type provides for this
generic uninterpreted data behavior. This is a helper function for assigning the
header type value, and sometimes inheriting from a Base object prototype, for
all OpenFlow payload type definitions.

```
// Import the Data type
var dt = require('./data');
var util = require('./util');

// Construct a new payload type
function Hello(data) {
  ...
  // Call the base class constructor
  dt.Data.call(this, data);
}
// Establish its header type value of '0' and inherit from Data
util.makePayload(Hello, 0, dt.Data);

function Error(type, code, data) {
  this.type = ...;
  this.code = ...;
  // Call the base class constructor
  dt.Data.call(this, data);
}
// Establish its header type value of '1' and inherit from Data
util.makePayload(Hello, 1, dt.Data);

Error.prototype.fromView = function(view) {
  // Perform error field deserialization
  ...
  // Call the base class deserializer
  dt.Data.prototype.fromView.call(this, view);
};
```

#### fromView(Type, view)
This is a simple helper function that constructs a default object of `Type`,
immediately calls the `fromView` deserialization operation on that object, and
then returns the object. This pattern can be quite useful for cutting down on
code verbosity.

```
var msg = util.fromView(Message, view);
var hdr = util.fromView(Header, view);
var hello = util.fromView(Hello, view);
```

#### makeIndex(Type)
This is a builder function used by every OpenFlow versioned payload module to
export a map of payload type values to payload Types. This map is a necessary
input for generic message construction over any version of OpenFlow. In order
for the map to work, each Type (Hello, Error, etc.) must export a Type value. As
long as a payload type is built using the `makePayload` helper and a type value
is supplied, this property will hold.

```
// constructs a map of the payload types
var map = util.makeIndex([
  Hello,
  Error,
  ...
]);

// Resultant object
// {
//   "0": Hello,
//   "1": Error,
//   ...
// }
```

#### Variant(Map)
This is a helper function that builds a function object for the construction of
variant types. The input to the function is a Map from a type string to a Type.
The returned value is a function that takes a type value and view and will
construct and deserialize the appropriate Type at runtime.

```
// Construct a variant over a map of payload types
var variant = util.Variant({
  "0": Hello,
  "1": Error,
  ...
});
// Deserialize a header
var hdr = util.fromView(Header, view);
// Execute the variant deserializer based on input form the header
var payload = variant(hdr.type, view);
```

