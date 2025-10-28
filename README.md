# Introduction
Wakeup devices with MagicPackets/WoL.

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Configuration
| Label         | Description                               | Example Value               | Required |
| ------------- | ----------------------------------------- | --------------------------- | -------- |
| `wol.enabled` | Enable/Disable endpoint/device capability | `wol.enabled=true`          | Yes      |
| `wol.mac`     | MAC Address of the NIC to wakeup          | `wol.mac=AA:BB:CC:DD:EE:FF` | No       |

> [!IMPORTANT]  
> If the device has no "WoL" interface, one will automaticly created **if** `wol.mac` is provided<br />
> Otherwise you have to add on manually:

```js
{
   socket: "udp",
   settings: {
      host: "255.255.255.255",
      port: 9,
      mac: "AA:BB:CC:DD:EE:FF"
   }
}
```

# Example Endpoint Data:
```json
{
    "_id": "678a5c8a030c8571b0badf9e",
    "device": "678a5c8a030c8571b0badf9b",
    "name": "Samsung TV",
    "commands": [...],
    "timestamps": {
        "created": 1737120906376,
        "updated": 1761473690082
    },
    "labels": [
        "wol.enabled=true",
        "wol.mac=f8:3f:51:fd:ae:b2"
    ],
    "enabled": true,
    "room": "62a4bbbfd9256b5e8d69889b",
    "states": [],
    "icon": "fa-solid fa-tv",
}    
```

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"Wake on LAN",
   "version": "1.0.0",
   "intents":[
      "devices",
      "endpoints"
   ],
   "uuid": "f887e0e7-7f48-4bb8-b04f-59551d5ac885"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-wol/ ~/projects/OpenHaus/backend/plugins/f887e0e7-7f48-4bb8-b04f-59551d5ac885/
```
