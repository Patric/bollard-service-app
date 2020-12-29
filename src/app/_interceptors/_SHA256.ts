
export class SHA256{


    constructor(){
        
    }



    

    testHashing(){
      var encoder = new TextEncoder();

     

    }

    processInputMessage(InputString: String){
      console.log("crypto: ",  crypto.getRandomValues(new Uint32Array([4,4,3,5,67,8,9,3,4,56,2,3,5,9])));
      
    // Function ProcessInputMessage
    let S0; // Sigma0(HashA)  
    let S1; // Sigma1(HashE)  
    let maj; // Majority (A,B,C)
    let ch; // Choose (E,F,G)
    let temp1, temp2;
    let w = new Uint32Array(64); //Holds input message
    let s0 = new Uint32Array(64); //Numbers to generate w[i]
    let s1 = new Uint32Array(64); //Number to generate w[i]


    // Initial hash value
    let a, h0=0x6A09E667;
    let b, h1=0xBB67AE85;
    let c, h2=0x3C6EF372;
    let d, h3=0xA54FF53A;
    let e, h4=0x510E527F;
    let f, h5=0x9B05688C;
    let g, h6=0x1F83D9AB;
    let h, h7=0x5BE0CD19;


    // Initial array of round constants:
    let k = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
        
        


    let n = 0;
    let LengthOfInputString = 0;
    let ByteIndex = 0;
    let WordIndex = 0;
    let WordPointer;
    let NoOfWordsUsed; 
    let BytePosToWriteBit1;
    let ByteInWord2WriteBit1;
    let InputStringBitLength;
    let i; // i use for S0 and S1
    let ByteInputString = new Uint8Array(1);

    

        LengthOfInputString = InputString.length;

        if(LengthOfInputString > 55 ){
            console.error("Input string exceeds 55 bytes");
            return Error("Input string exceeds 55 bytes");
        }

          // could be a variable?
    WordPointer= Math.floor(LengthOfInputString / 4);//Point to the last word which was written
    NoOfWordsUsed=WordPointer + 1;

    console.log("NoOfWords used: ", NoOfWordsUsed);

        for (WordIndex=0; WordIndex<=NoOfWordsUsed; WordIndex++) {
            for (ByteIndex=0; ByteIndex<=3; ByteIndex++) {
            console.log("w clear ", w[WordIndex]);
              w[WordIndex]=w[WordIndex]<<8; //Shift left one byte
              console.log("w: ", w[WordIndex]);
              ByteInputString[0] = InputString.charCodeAt(n);
              console.log("ByteInut ", ByteInputString);
              //ByteInputString = new Uint8Array([].map.call(InputString, x =>{ //   InputString.charAt(n);
               // return x.charCodeAt(n) }));
              w[WordIndex]=w[WordIndex]+ByteInputString[0];      
              console.log("w after: ", w[WordIndex]);
              n++;
            }
          }


  //Append '1' bit at (WordPointer and Byte in word to write)
  BytePosToWriteBit1=LengthOfInputString+1;
  ByteInWord2WriteBit1=BytePosToWriteBit1-(WordPointer*4);
  console.log("ByteInWord2WriteBit1", ByteInWord2WriteBit1);
  switch (ByteInWord2WriteBit1) {
    case 1:
    // | is bitwise or
      w[WordPointer]=w[WordPointer].valueOf() | 0x80000000;
      break;
    case 2:
      w[WordPointer]=w[WordPointer].valueOf() | 0x00800000;
      break;
    case 3:
      w[WordPointer]=w[WordPointer].valueOf() | 0x00008000;
      break;
    case 4:
      w[WordPointer]=w[WordPointer].valueOf() | 0x00000080;
      break;    
  }

  console.log("w array is: ", w);
  //Write input string bit length to last two words, w[14] and w[15]
  InputStringBitLength=LengthOfInputString*8;
  w[14]=0x0; //This version supports only 55 character of input message, so w[14] is always 0
  w[15]=w[15].valueOf()+InputStringBitLength;

  //console.log(InputStringBitLength,HEX);
  //console.logln();

  w.forEach(value => console.log("value of w: ", value));

  console.log("w of index 16: ", w[16].valueOf());

  //Calculate s0[i], s1[i] and w[i]
  for (i=16; i<=63; i++) {
    s0[i]=this.Gets0(w[i-15].valueOf());
    console.log("s0: ", s0[i].valueOf())
    s1[i]=this.Gets1(w[i-2].valueOf());
    //s1[i] = 0;
    console.log("s1: ", s1[i].valueOf(), i, w[i-2].valueOf());
    w[i]=w[i-16].valueOf() + s0[i].valueOf() + w[i-7].valueOf() + s1[i].valueOf(); 
    console.log("w[i]: ", w[i].valueOf(), "----------------------------");//lo
}  

  //Initialize working variables to current hash value:
  a=h0;
  b=h1;
  c=h2;
  d=h3;
  e=h4;
  f=h5;
  g=h6;
  h=h7;


    //Compression function main loop
  for (i=0; i<=63; i++) {
    S1=this.GetSigma1(e);
    ch=this.GetChoose(e,f,g);
    temp1=h+S1+ch+k[i]+w[i];
    S0=this.GetSigma0 (a);
    maj=this.GetMajority(a,b,c);
    temp2=S0+maj;

    //Assign new hash then loop again
    h=g;
    g=f;
    f=e;
    e=d+temp1;
    d=c;
    c=b;
    b=a;
    a=temp1+temp2;

   

  }

  //Final hash result, add original hash with the last caculated hash
  h0=h0+a;
  h1=h1+b;
  h2=h2+c;
  h3=h3+d;
  h4=h4+e;
  h5=h5+f;
  h6=h6+g;
  h7=h7+h;

 
  //let hashed = h0 + h1 + h3 + h4 + h5 + h6 + h7;
 // console.log("SHA256 hashed output message: ", hashed)
  //Print the result
  
  this.PrintWithLeadingZero(h0);
  this.PrintWithLeadingZero(h1);
  this.PrintWithLeadingZero(h2);
  this.PrintWithLeadingZero(h3);
  this.PrintWithLeadingZero(h4);
  this.PrintWithLeadingZero(h5);
  this.PrintWithLeadingZero(h6);
  this.PrintWithLeadingZero(h7);



    }

// Function GetS1 (s1[i])
Gets1 (wi2Receive:  number) {
let s1Return = new Uint32Array([wi2Receive]);
let debug = wi2Receive;
let uint = number => Math.sqrt(Math.pow(number, 2));

let uint32 = new Uint32Array([wi2Receive]);


console.log("BITWISE BETWEEN: ", debug, " AND ", 0x0001ffff);

uint32[0] = (uint32[0] & 131071)<<32-17;

let s1Return_ = new Uint32Array([wi2Receive]);

s1Return_[0] = uint32[0].valueOf();
console.log("First binary: ", s1Return_[0].valueOf(), " or", (wi2Receive.valueOf() & 131071 << 15));

let uint32_b = new Uint32Array([wi2Receive]);


console.log("RESULT: ", s1Return[0]);
return s1Return[0];

}

// Function Gets0[i]
Gets0 (wi15Receive) {
let s0Return = new Uint32Array(1);
s0Return[0]=((wi15Receive&0x0000007f)<<32-7)+(wi15Receive>>7)^((wi15Receive&0x0003ffff)<<32-18)+(wi15Receive>>18)^(wi15Receive>>3);
return s0Return[0];
}

// Function GetChoose(E,F,G)
GetChoose (HashE, HashF, HashG) {
let Choose = new Uint32Array(1);
Choose[0]=(HashE & HashF)^((~HashE)&HashG);  
return Choose[0];}


// Function GetMajority

GetMajority (HashA,HashB, HashC) {
let Majority = new Uint32Array(1);; //Majority(A,B,C)
Majority[0]=(HashA&HashB)^(HashA&HashC)^(HashB&HashC);
console.log("Majority ", Majority[0]);
return Majority[0]
;}

// Function GetSigma0
GetSigma0 (InputHash) {
let TempSigma0 = new Uint32Array(1);
TempSigma0[0]=((InputHash&0x00000003)<<32-2)+(InputHash>>2)^((InputHash&0x00001fff)<<32-13)+(InputHash>>13)^((InputHash&0x003fffff)<<32-22)+(InputHash>>22);
return TempSigma0[0];
}

// Function GetSigma1

GetSigma1 (InputHash) {
let TempSigma1= new Uint32Array(1);
TempSigma1[0]=((InputHash&0x0000003f)<<32-6)+(InputHash>>6)^((InputHash&0x000007ff)<<32-11)+(InputHash>>11)^((InputHash&0x01ffffff)<<32-25)+(InputHash>>25);
return TempSigma1[0];
}

// Function PrintWithLeadingZero

PrintWithLeadingZero (ReceiveUnsignedLong) {
let TempLz;
  TempLz=ReceiveUnsignedLong&0xf0000000; TempLz=TempLz>>28; console.log("hex", String.fromCharCode(TempLz));
  TempLz=ReceiveUnsignedLong&0x0f000000; TempLz=TempLz>>24; console.log(TempLz, "hex");
  TempLz=ReceiveUnsignedLong&0x00f00000; TempLz=TempLz>>20; console.log(TempLz,"hex");
  TempLz=ReceiveUnsignedLong&0x000f0000; TempLz=TempLz>>16; console.log(TempLz, "hex");
  TempLz=ReceiveUnsignedLong&0x0000f000; TempLz=TempLz>>12; console.log(TempLz, "hex");
  TempLz=ReceiveUnsignedLong&0x00000f00; TempLz=TempLz>>8; console.log(TempLz, "hex");
  TempLz=ReceiveUnsignedLong&0x000000f0; TempLz=TempLz>>4; console.log(TempLz, "hex");
  TempLz=ReceiveUnsignedLong&0x0000000f; TempLz=TempLz>>0; console.log(TempLz, "hex");



}

}

/*

// Function GetS1 (s1[i])

private s1Return;
Gets1 (wi2Receive) {
this.s1Return=((wi2Receive & 0x0001ffff)<<32-17)+(wi2Receive>>17)^((wi2Receive & 0x0007ffff)<<32-19)+(wi2Receive>>19)^(wi2Receive>>10);
return this.s1Return;

}

// Function Gets0[i]
private s0Return;
Gets0 (wi15Receive) {
this.s0Return=((wi15Receive&0x0000007f)<<32-7)+(wi15Receive>>7)^((wi15Receive&0x0003ffff)<<32-18)+(wi15Receive>>18)^(wi15Receive>>3);
return this.s0Return;
}

// Function GetChoose(E,F,G)
private Choose ;
GetChoose (HashE, HashF, HashG) {

this.Choose=(HashE & HashF)^((~HashE)&HashG);  
return this.Choose;}


// Function GetMajority
private Majority; //Majority(A,B,C)
GetMajority (HashA,HashB, HashC) {
  this.Majority=(HashA&HashB)^(HashA&HashC)^(HashB&HashC);
return this.Majority;}

// Function GetSigma0
private TempSigma0 ;
GetSigma0 (InputHash) {
this.TempSigma0=((InputHash&0x00000003)<<32-2)+(InputHash>>2)^((InputHash&0x00001fff)<<32-13)+(InputHash>>13)^((InputHash&0x003fffff)<<32-22)+(InputHash>>22);
return this.TempSigma0;
}

// Function GetSigma1
private TempSigma1
GetSigma1 (InputHash) {
this.TempSigma1=((InputHash&0x0000003f)<<32-6)+(InputHash>>6)^((InputHash&0x000007ff)<<32-11)+(InputHash>>11)^((InputHash&0x01ffffff)<<32-25)+(InputHash>>25);
return this.TempSigma1;
}

// Function PrintWithLeadingZero
private TempLz;
PrintWithLeadingZero (ReceiveUnsignedLong) {

  this.TempLz=ReceiveUnsignedLong&0xf0000000; this.TempLz=this.TempLz>>28; console.log("hex", parseInt(this.TempLz, 16));
  this.TempLz=ReceiveUnsignedLong&0x0f000000; this.TempLz=this.TempLz>>24; console.log(this.TempLz, "hex");
  this. TempLz=ReceiveUnsignedLong&0x00f00000; this.TempLz=this.TempLz>>20; console.log(this.TempLz,"hex");
  this. TempLz=ReceiveUnsignedLong&0x000f0000; this.TempLz=this.TempLz>>16; console.log(this.TempLz, "hex");
  this. TempLz=ReceiveUnsignedLong&0x0000f000; this.TempLz=this.TempLz>>12; console.log(this.TempLz, "hex");
  this.TempLz=ReceiveUnsignedLong&0x00000f00; this.TempLz=this.TempLz>>8; console.log(this.TempLz, "hex");
  this. TempLz=ReceiveUnsignedLong&0x000000f0; this.TempLz=this.TempLz>>4; console.log(this.TempLz, "hex");
  this. TempLz=ReceiveUnsignedLong&0x0000000f; this.TempLz=this.TempLz>>0; console.log(this.TempLz, "hex");



}

*/