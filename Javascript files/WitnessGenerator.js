const utils = require("ffjavascript").utils;
const MerkleTree = require('./merkle.js');
const {ProofOfVoteValidity, verifyVoteValidity} = require("./ProofOfVoteValidity");
const {BabyJubPoint, Fr, randFr, G, keyGenRand, keyGen} = require("./BabyJubPoint")
const mimcjs = require("./node_modules/circomlib/src/mimc7.js");
const Schnorr = require("./SchnorrSignature.js");
var fs = require('fs');

let merkleTree = new MerkleTree();
const merkleDepth = 8;
const voterCount = 10;

var output = [];
const voterPKstring = [];
const voterPK = [];
const voterSK = [];
const updatedVoterPK = [];
for(let i = 0; i < 2**(merkleDepth); i++){
  let sss = keyGenRand();
  voterPK.push(
    {
      x:sss.Public_point.x,
      y:sss.Public_point.y
    });
    voterPKstring.push(
      {
        x:sss.Public_point.x.toString(),
        y:sss.Public_point.y.toString()
      });
  updatedVoterPK.push(
    {
      x:sss.Public_point.x,
      y:sss.Public_point.y
    });
  voterSK.push(sss.Secret_in_field);
}
console.log(voterSK[0]);
console.log(voterSK[2]);
console.log(voterSK[4]);
console.log(voterSK[6]);
console.log(voterSK[8]);
console.log(voterSK[10]);
console.log(voterSK[12]);
console.log(voterSK[14]);
console.log(voterSK[16]);
console.log(voterSK[18]);

let new_voters_list = JSON.stringify(voterPKstring);
fs.writeFileSync('voters.json', new_voters_list);

merkleTree.addLeaves(voterPK, true);  // add multiple leaves, need to make hashes
merkleTree.makeTree();

let mroot = merkleTree.getMerkleRoot();
//console.log("mroot is",mroot);
let mmroot;
// console.log(mroot);
output.push(mroot.toString());


let updatedMerkleTree = new MerkleTree();
////
//previous R and C
var R = new BabyJubPoint(0n,1n);
// console.log("R",R);
var C = new BabyJubPoint(0n,1n);
// console.log("C",C);
output.push([R.x.toString(),R.y.toString()]);
output.push([C.x.toString(),C.y.toString()]);

const BabyJubJub = new BabyJubPoint();
const public_key_of_election = BigInt("20884255930686334558934826649896200228482552620457618951618098627107568075027");
const bufferedPubKey = utils.leInt2Buff(public_key_of_election , 32);
const unCompressed = BabyJubJub.decompress(bufferedPubKey);
output.push([unCompressed[0].toString(),unCompressed[1].toString()]);
let H = new BabyJubPoint(unCompressed[0],unCompressed[1]);
let prover = new ProofOfVoteValidity(H);


  var voterPubKeyArray = [];
  var rs = [];
  var cs = [];
  var ss = [];
  var es = [];
  var a1s = [];
  var a2s = [];
  var b1s = [];
  var b2s = [];
  var d1s = [];
  var d2s = [];
  var r1s = [];
  var r2s = [];

  var voterID = [];
  var voterHexId = [];

  var proofArr = [];
  for (let i = 0; rs.length < voterCount; i+=2){
    let {encryptedVote, commitment} = prover.voteCommit(0);
    // console.log(commitment);
    let c =  mimcjs.multiHash([encryptedVote.X.x, encryptedVote.X.y, encryptedVote.Y.x, encryptedVote.Y.y, commitment.A1.x, commitment.A1.y,commitment.B1.x, commitment.B1.y,commitment.A2.x, commitment.A2.y,commitment.B2.x, commitment.B2.y]);

    let proof = prover.generateProof(c);
    // console.log(proof);
    // console.log("d2:",proof.d2);
    if(proof.d2 < 0n || proof.d1 < 0n){
      console.log("d1 or d2 < 0 and i=",i);
      continue;
    }
    let res = verifyVoteValidity(H, encryptedVote, commitment, c, proof)
    if (!res) {
        console.log("something's wrong!")
    }

    if(proof.d1 instanceof Fr){
      d1s.push(proof.d1.n.toString());
    }else{
      d1s.push(proof.d1.toString());
    }
    if(proof.d2 instanceof Fr){
      d2s.push(proof.d2.n.toString());
    }else{
      d2s.push(proof.d2.toString());
    }
    // d2s.push(proof.d2.n.toString());
    r1s.push(proof.r1.n.toString());
    r2s.push(proof.r2.n.toString());
    // console.log(proof);
    // console.log(voterSK[i]);
    const voterSignature = Schnorr.sign(BigInt(voterSK[i]), [BigInt(encryptedVote.X.x), BigInt(encryptedVote.X.y), BigInt(encryptedVote.Y.x), BigInt(encryptedVote.Y.y)]);
    //console.log("Message: ",mimcjs.multiHash([BigInt(encryptedVote.X.x), BigInt(encryptedVote.X.y), BigInt(encryptedVote.Y.x), BigInt(encryptedVote.Y.y)]));
    voterPubKeyArray.push([voterPK[i].x.toString(),voterPK[i].y.toString()]);
    rs.push([encryptedVote.X.x.toString(),encryptedVote.X.y.toString()]);
    cs.push([encryptedVote.Y.x.toString(),encryptedVote.Y.y.toString()]);
    ss.push(voterSignature.S.toString());
    es.push(voterSignature.E.toString());
    a1s.push([commitment.A1.x.toString(),commitment.A1.y.toString()]);
    a2s.push([commitment.A2.x.toString(),commitment.A2.y.toString()]);
    b1s.push([commitment.B1.x.toString(),commitment.B1.y.toString()]);
    b2s.push([commitment.B2.x.toString(),commitment.B2.y.toString()]);

    const rPoint = new BabyJubPoint(encryptedVote.X.x,encryptedVote.X.y);
    const cPoint = new BabyJubPoint(encryptedVote.Y.x,encryptedVote.Y.y);
    // console.log(rPoint);
    // console.log(cPoint);
    R = R.add(rPoint);
    // console.log(R);
    C = C.add(cPoint);
    // console.log(C);

    voterHexId.push('0x'+i.toString(16).padStart(8, "0"));
    voterID.push(i);

    //last one?
    if(i == 0){
      let pathDigest = merkleTree.getProof(i);
      console.log(pathDigest);
      var array = [];
      for(let i = 0;i < pathDigest.length;i++){
        if(pathDigest[i].left){
          // console.log(proof[i].left);
          array.push(pathDigest[i].left.toString());
        }else{
          array.push(pathDigest[i].right.toString());
        }
      }
    }else{
      let pathDigest = updatedMerkleTree.getProof(i);
      // console.log(pathDigest);
      var array = [];
      for(let i = 0;i < pathDigest.length;i++){
        if(pathDigest[i].left){
          // console.log(proof[i].left);
          array.push(pathDigest[i].left.toString());
        }else if(pathDigest[i].right){
          array.push(pathDigest[i].right.toString());
        }else{
          array.push(pathDigest[i].toString());
        }
      }
    }


    updatedVoterPK[i] = 0n;
    // console.log(updatedVoterPK);

    updatedMerkleTree.resetTree();
    updatedMerkleTree.addLeaves(updatedVoterPK, true);  // add multiple leaves, need to make hashes
    updatedMerkleTree.makeTree();
    //console.log("updated merkle",updatedMerkleTree.getLeaves());
    mmroot = updatedMerkleTree.getMerkleRoot();
    //console.log("mmroot is ", mmroot);

    proofArr.push(array);

    console.log("vote generated");

  }
  console.log("_______________________________________");
  // console.log(R);
  // console.log(C);
  output.push([R.x.toString(),R.y.toString()]);
  output.push([C.x.toString(),C.y.toString()]);
  output.push(voterPubKeyArray);
  output.push(rs);
  output.push(cs);
  output.push(ss);
  output.push(es);
  output.push(a1s);
  output.push(a2s);
  output.push(b1s);
  output.push(b2s);
  output.push(d1s);
  output.push(d2s);
  output.push(r1s);
  output.push(r2s);

  // console.log(updatedVoterPK);
  //voterID add to output
  output.push(voterID);

  // console.log(updatedVoterPK);

  // console.log(mmroot);
  output.push(mmroot.toString());


  // var arr = [];
  // voterID.forEach(element => {
  //   let proof = merkleTree.getProof(element);
  //   // console.log(proof);
  //   var array = [];
  //   for(let i = 0;i<proof.length;i++){
  //     if(proof[i].left){
  //       // console.log(proof[i].left);
  //       array.push(proof[i].left.toString());
  //     }else{
  //       array.push(proof[i].right.toString());
  //     }
  //   }
  //   arr.push(array);
  // });
  output.push(proofArr)
  console.log("output begin___");
  // console.log(output);

  var finalOutput = [output[0],output[1],output[2],output[20],output[4],output[5],output[3],voterHexId,output[6],output[21],output[7],output[8],output[9],output[10],output[11],output[12],output[13],output[14],output[15],output[16],output[17],output[18]];
  var json = JSON.stringify(finalOutput);
  fs.writeFile ("input.json", json, function(err) {
    if (err) throw err;
    console.log('complete');
  });
  console.log(finalOutput);
