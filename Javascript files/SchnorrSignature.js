const utils = require("ffjavascript").utils;
const { order,F } = require("./node_modules/circomlib/src/babyjub.js");
const BabyJubJub = require("./BabyJubPoint");
const mimcjs = require("./node_modules/circomlib/src/mimc7.js");


    function sign(secretValue, array){
      const xValue = BigInt(secretValue);
      const kValue = BabyJubJub.randFr();
      // console.log(kValue);
      const rValue = BabyJubJub.G.mul(kValue);
      // console.log(rValue);
      const M = mimcjs.multiHash(array);
      // console.log(M);
      // console.log([rValue.x, rValue.y, M]);
      //
      const eValue = mimcjs.multiHash([rValue.x, rValue.y, M]);
      // console.log(eValue);
      const a = (xValue * eValue) % order;
      // console.log(a);
      if((kValue.n - a) > 0){
        let sValue = (kValue.n - a) % order;
        // console.log(sValue);
        return {'E': eValue , 'S': sValue }
      }
      if((kValue.n - a) < 0){
        let sValue = (kValue.n - a) + order;
        // console.log(sValue);
        return {'E': eValue , 'S': sValue }
      }

    }
    function verify(e,s,publicKey,M){
      const public_key = BigInt(publicKey);
      const bufferedPubKey = utils.leInt2Buff(public_key,32);
      const babyJub = new BabyJubJub.BabyJubPoint();
      // console.log(babyJub);
      const unCompressed = babyJub.decompress(bufferedPubKey);
      // console.log(unCompressed);

      const babyJubJub = new BabyJubJub.BabyJubPoint(unCompressed[0],unCompressed[1]);
      const sG = BabyJubJub.G.mul(s);
      // console.log(sG);
      const eY = babyJubJub.mul(e);
      // console.log(eY);
      const rv = sG.add(eY);
      // console.log(rv);
      const m = mimcjs.multiHash(M);
      // console.log(m);
      const ev = mimcjs.multiHash([rv.x,rv.y,m]);

      if(ev == e){
        return true;
      }
      else{
        return false;
      }

    }


exports.sign = sign;
exports.verify = verify;
