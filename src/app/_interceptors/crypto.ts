
export class SHA{
    
  
  
  generate(){

    let encoder = new TextEncoder();
    let key = new Uint8Array([0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c,0x0c]);
    window.crypto.subtle.importKey(
      "raw", // raw format of the key - should be Uint8Array
      //this.encoder.encode("mysecretkey"),
      key,
      { // algorithm details
          name: "HMAC",
          hash: {name: "SHA-256"}
      },
      false, // export = false
      ["sign", "verify"] // what this key can do
  ).then( key => {
      window.crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode("The quick brown fox")
      ).then(signature => {
          var b = new Uint8Array(signature);
          var str = Array.prototype.map.call(b, x => ('00'+x.toString(16)).slice(-2)).join("")
          console.log("key: ", str);
      });
  });

  
  }


}

