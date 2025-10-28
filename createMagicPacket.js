module.exports = function createMagicPacket(mac) {

    mac = mac.replace(/:/g, "");

    const MAC_REPEAT = 16;
    const MAC_LENGTH = 0x06;
    const PACKET_HEADER = 0x06;
    const parts = mac.match(/[0-9a-fA-F]{2}/g);

    if (!parts || parts.length != MAC_LENGTH) {
        throw new Error(`malformed MAC address "${mac}"`);
    }

    let buffer = Buffer.alloc(PACKET_HEADER);
    let bufMac = Buffer.from(parts.map(p => parseInt(p, 16)));

    buffer.fill(0xff);

    for (var i = 0; i < MAC_REPEAT; i++) {
        buffer = Buffer.concat([
            buffer,
            bufMac
        ]);
    }

    return buffer;

};