const { deserialize } = require("../../system/component/class.labels.js");

const createMagicPacket = require("./createMagicPacket.js");


module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints"
    ], async (scope, [
        C_DEVICES,
        C_ENDPOINTS
    ]) => {

        C_ENDPOINTS.found({
            labels: [
                "wol.enabled=true"
            ]
        }, async (endpoint) => {
            try {

                // TODO: create n magic packets & send with delay (respet wol.repeat label)
                // TODO: respect wol.enabled=*, if false do nothing

                logger.debug(`Endpoint "${endpoint.name}" marked as WoL capable`);

                let device = await C_DEVICES.get(endpoint.device);
                //let labels = endpoint.labels.parse()?.wol; 
                // see: https://github.com/OpenHausIO/backend/issues/536#issuecomment-3441554858
                let labels = deserialize(endpoint.labels.map(({ label }) => label))?.wol;


                if (!device) {
                    return;
                }

                let iface = device.interfaces.find(({ settings }) => {
                    return settings.port === 9 && settings.host === "255.255.255.255";
                });

                if (!iface || !iface?.settings?.mac) {

                    if (!labels?.mac) {
                        return;
                    }

                    let length = device.interfaces.push({
                        settings: {
                            socket: "udp",
                            host: "255.255.255.255",
                            port: 9,
                            mac: labels.mac
                        }
                    });

                    await C_DEVICES.update(device._id, device);
                    iface = device.interfaces[length - 1];

                }


                let cmd = endpoint.commands.find(({ alias }) => {
                    return alias === "WOL";
                });

                if (!cmd) {

                    let length = endpoint.commands.push({
                        name: "WoL",
                        alias: "WOL",
                        interface: iface._id
                    });

                    await C_ENDPOINTS.update(endpoint._id, endpoint);
                    cmd = endpoint.commands[length - 1];

                }

                cmd.setHandler((obj, done) => {

                    let stream = iface.bridge();
                    let packet = createMagicPacket(iface.settings.mac);

                    stream.write(packet, () => {
                        stream.once("readable", () => {

                            let chunk = stream.read();

                            if (chunk) {

                                logger.debug(`received wol response:`, chunk.length == packet.length, chunk);

                                if (chunk.length == packet.length) {
                                    done(null, true);
                                } else {
                                    done(null, false);
                                }

                            }

                        });
                    });


                });

            } catch (e) {

                logger.warn(e, "Could not setup device/endpoint");

            }
        });


    });
};
