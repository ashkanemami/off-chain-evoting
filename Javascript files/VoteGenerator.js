const {BabyJubPoint, Fr, randFr, G, keyGen} = require("./BabyJubPoint")
const POSTHTTP = require("./POSTHttp.js");
const {ProofOfVoteValidity, verifyVoteValidity} = require("./ProofOfVoteValidity");
const utils = require("ffjavascript").utils;
const mimcjs = require("./node_modules/circomlib/src/mimc7.js");


const BabyJubJub = new BabyJubPoint();
const public_key_of_election = BigInt("20884255930686334558934826649896200228482552620457618951618098627107568075027");
const bufferedPubKey = utils.leInt2Buff(public_key_of_election,32);
const unCompressed = BabyJubJub.decompress(bufferedPubKey);

async function voteGen(){

  for (let i = 0; i < 1; i++) {
      console.log('uncompressed publick key:', unCompressed);
      let H = new BabyJubPoint(unCompressed[0],unCompressed[1]);
      // let c = randFr();
      let prover = new ProofOfVoteValidity(H);
      let {encryptedVote} = prover.voteGenerate(0);

      let X_of_encrypt = utils.leBuff2int(encryptedVote.X.compress());
      let Y_of_encrypt = utils.leBuff2int(encryptedVote.Y.compress());
      //send to randomizer
      var sendData = {
  Â Â Â Â "Y":Â {
  Â Â Â Â Â Â Â Â "X":Â unCompressed[0].toString(),
  Â Â Â Â Â Â Â Â "Y":Â unCompressed[1].toString()
  Â Â Â Â },
  Â Â Â Â "R":Â {
  Â Â Â Â Â Â Â Â "X":Â encryptedVote.X.x.toString(),
  Â Â Â Â Â Â Â Â "Y":Â encryptedVote.X.y.toString()
  Â Â Â Â },
  Â Â Â Â "C":Â {
          "X":Â encryptedVote.Y.x.toString(),
    Â Â Â Â Â Â "Y":Â encryptedVote.Y.y.toString()
  Â Â Â Â }
  }
    console.log(sendData);
    const http = new POSTHTTP.POSTHttp;
    var randomizerOutput = await http.post(
    'http://localhost:10000',
     sendData)
     console.log(randomizerOutput);

    const randomVote = {"X": new BabyJubPoint(randomizerOutput.R.X,randomizerOutput.R.Y), "Y": new BabyJubPoint(randomizerOutput.C.X,randomizerOutput.C.Y)}
    const randomizerVal = {"K1": new BabyJubPoint(randomizerOutput.K1.X,randomizerOutput.K1.Y), "K2": new BabyJubPoint(randomizerOutput.K2.X,randomizerOutput.K2.Y)}

    let commitment = prover.randomizerVoteCommit(0,randomVote.X,randomVote.Y,randomizerVal.K1,randomizerVal.K2,randomizerOutput.s);

    const cprime = mimcjs.multiHash([randomVote.X.x, randomVote.X.y, randomVote.Y.x, randomVote.Y.y, commitment.A1.x, commitment.A1.y,commitment.B1.x, commitment.B1.y,commitment.A2.x, commitment.A2.y,commitment.B2.x, commitment.B2.y]);
    const c = mimcjs.multiHash([randomizerVal.K1.x,randomizerVal.K1.y, randomizerVal.K2.x, randomizerVal.K2.y]);
    console.log("c is:",c);

    const val1 = G.mul(BigInt(randomizerOutput.Sign.s));
    const secretValue = BigInt("17998029341895603874555715694315180981411519868281316879314517204337789871728");
    let ssss = keyGen(secretValue);
    const val2 = ssss.Public_point.mul(BigInt(randomizerOutput.Sign.s));
    console.log(val1);
    console.log(val2);
    const val3 = val1.add(val2);
    console.log(val3);
    const M = mimcjs.multiHash([randomVote.X.x,randomVote.X.y,randomVote.Y.x,randomVote.Y.y]);
    console.log(M);
    const hashh = mimcjs.multiHash([val3.x,val3.y,M]);
    console.log(hashh);

      let proof = prover.randomizerGenerateProof(cprime,c,BigInt(randomizerOutput.s));
      //
      let res = verifyVoteValidity(H, randomVote, randomizerVal, commitment, c, cprime, proof)
      if (!res) {
          console.log("something's wrong!")
      }
  }
};

voteGen();
