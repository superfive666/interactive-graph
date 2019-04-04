
// MATH RANDOM METHOD FOR ID GENERATION
export function generateIdString() {
    return "id-v1-" + Math.random().toString(36).substr(2, 16);
}

// MD5 HASHING ON THE ID V1
export function getUUID() {
    var byteToHex = [];
    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }
    // TBD
    return "";
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return ([bth[buf[i++]], bth[buf[i++]], 
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]]).join('');
}