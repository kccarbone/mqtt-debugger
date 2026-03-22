# mqtt-debugger

Simple debug util for MQTT client traffic.

## Usage

```bash
mqtt-debugger [options] [topicFilter] [propFilter] [valueFilter]
```

The command subscribes to the broker and prints only messages matching your filters.

### CLI arguments

#### Options

| Option | Default | Description |
| --- | --- | --- |
| `-h <host>` | `localhost` | MQTT broker host |
| `-p <port>` | `1883` | MQTT broker port |
| `-a <username:password>` | `admin:password` | MQTT credentials in `username:password` format |

#### Positional arguments

| Argument | Default | Description |
| --- | --- | --- |
| `topicFilter` | `#` | Case-insensitive regex matched against topic names |
| `propFilter` | `''` | Case-insensitive regex matched against JSON property names |
| `valueFilter` | `''` | Case-insensitive regex matched against matched property values |

Notes:
- Filters are interpreted as JavaScript regular expressions.
- Message payloads are parsed as JSON.

## Usage examples

Listen to everything on localhost:

```bash
npx @kcarbone/mqtt-debugger
```

Connect to a remote broker with auth:

```bash
npx @kcarbone/mqtt-debugger -h broker.example.com -p 1883 -a myuser:mypassword
```

Show only topics containing `sensor`:

```bash
npx @kcarbone/mqtt-debugger sensor
```

Show only `temperature` properties from topics matching `devices/`:

```bash
npx @kcarbone/mqtt-debugger 'devices/' 'temperature'
```

Show only `status` values matching `error|fail` from topics matching `devices/`:

```bash
npx @kcarbone/mqtt-debugger 'devices/' 'status' 'error|fail'
```
