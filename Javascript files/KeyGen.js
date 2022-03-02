const BabyJubJub = require("./BabyJubPoint")
const utils = require("ffjavascript").utils;
const {subOrder, Base8, F, addPoint, mulPointEscalar, inSubgroup, inCurve, packPoint} = require("./node_modules/circomlib/src/babyjub.js");
const {ProofOfVoteValidity, verifyVoteValidity} = require("./ProofOfVoteValidity");

console.log('Random mode:');
let sss = BabyJubJub.keyGenRand();
console.log('------------------------');
console.log("publickey is",sss.Public_key);
console.log('------------------------');
console.log("bigint random is",sss.Secret.toString());
console.log('------------------------');
console.log("secret in field",sss.Secret_in_field);
console.log('------------------------');
console.log("point is",sss.Public_point);
console.log('------------------------');
console.log('------------------------');

console.log('Secret mode:');
const secretValue = BigInt("17998029341895603874555715694315180981411519868281316879314517204337789871728");

let ssss = BabyJubJub.keyGen(secretValue);
console.log('------------------------');
console.log("secret in field is",ssss.infield.n);
console.log('------------------------');
console.log("publickey is",ssss.Public_key.toString());
console.log('------------------------');
console.log("publickey point is",ssss.Public_point);
console.log('------------------------');
