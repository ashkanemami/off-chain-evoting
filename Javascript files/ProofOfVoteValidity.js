const {BabyJubPoint, G, Fr, Frr, randFr, subOrder, order} = require("./BabyJubPoint");
const mimcjs = require("./node_modules/circomlib/src/mimc7.js");
const bigInt = require("big-integer");
const assert = require('assert');

class ProofOfVoteValidity {
    constructor(H = null) {
        if (H instanceof BabyJubPoint) {
            this.H = H;
        } else {
            assert(false, 'pubkey should a BabyJubPoint');
        }

        this.encryptedVote = {"X": new BabyJubPoint(), "Y": new BabyJubPoint()}
        this.commitment = {"A1": new BabyJubPoint(), "B1": new BabyJubPoint(), "A2": new BabyJubPoint(), "B2": new BabyJubPoint()};
        this.proof = {"d1": bigInt.zero, "d2": bigInt.zero, "r1": bigInt.zero, "r2": bigInt.zero};
        this.secrets = {"xi": bigInt.zero, "w": bigInt.zero};
    }

    voteCommit(v) {
        if (v === 1 || v === 0) {
            this.v = v;
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        this.secrets.xi = randFr();
        this.secrets.w = randFr();

        if (this.v === 1) {
            this.encryptedVote.X = G.mul(this.secrets.xi);
            this.encryptedVote.Y = this.H.mul(this.secrets.xi).add(G);

            this.proof.r1 = randFr();
            this.proof.d1 = randFr();
            if(this.proof.d1.n < subOrder){
              console.log("d1 < subOrder");
            }else{
              console.log("d1 > subOrder");
            }



            this.commitment.A1 = G.mul(this.proof.r1).add(this.encryptedVote.X.mul(this.proof.d1));
            this.commitment.B1 = this.H.mul(this.proof.r1).add(this.encryptedVote.Y.mul(this.proof.d1));

            this.commitment.A2 = G.mul(this.secrets.w);
            this.commitment.B2 = this.H.mul(this.secrets.w);
        } else if (this.v === 0) {
            this.encryptedVote.X = G.mul(this.secrets.xi)
            this.encryptedVote.Y = this.H.mul(this.secrets.xi)

            this.proof.r2 = randFr();
            this.proof.d2 = randFr();

            this.commitment.A1 = G.mul(this.secrets.w);
            this.commitment.B1 = this.H.mul(this.secrets.w);

            this.commitment.A2 = G.mul(this.proof.r2).add(this.encryptedVote.X.mul(this.proof.d2));
            this.commitment.B2 = this.H.mul(this.proof.r2).add(this.encryptedVote.Y.sub(G).mul(this.proof.d2));
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        return {"encryptedVote": this.encryptedVote, "commitment": this.commitment};
    }
    voteGenerate(v) {
        if (v === 1 || v === 0) {
            this.v = v;
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        this.secrets.xi = randFr();

        if (this.v === 1) {
            this.encryptedVote.X = G.mul(this.secrets.xi);
            this.encryptedVote.Y = this.H.mul(this.secrets.xi).add(G);

        } else if (this.v === 0) {
            this.encryptedVote.X = G.mul(this.secrets.xi)
            this.encryptedVote.Y = this.H.mul(this.secrets.xi)

        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        return {"encryptedVote": this.encryptedVote};
    }
    generateProof(c) {
        // if (c instanceof Fr) {
        //     this.c = c;
        // } else {
        //     this.c = new Fr(c);
        // }

        // console.log(c);
        if (this.v === 1) {
          // console.log("c",c);
          // console.log("1:",BigInt(c) - this.proof.d1.n);
          this.proof.d2 = (BigInt(c) - this.proof.d1.n) % BigInt(order);
          // console.log("2:",this.proof.d2 );
          // if(this.proof.d2 < 0){
          //   console.log("d2 < 0");
          //   return false;
          // }
          // console.log("d1: ",this.proof.d1.n);
          // console.log("d2: ",this.proof.d2);
            // this.proof.d2 = this.c.sub(this.proof.d1);
            this.proof.r2 = this.secrets.w.sub(this.secrets.xi.mul(this.proof.d2));
            // console.log("r2: ",this.proof.r2);
        } else if (this.v === 0) {
          this.proof.d1 = (BigInt(c) - this.proof.d2.n) % order;
          // console.log("d1: ",this.proof.d1);
          // console.log("d2: ",this.proof.d2.n);
            // this.proof.d1 = this.c.sub(this.proof.d2);
            this.proof.r1 = this.secrets.w.sub(this.secrets.xi.mul(this.proof.d1));
            // console.log("r1: ",this.proof.r1);
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        return this.proof
    }

    randomizerVoteCommit(v,newX,newY,K1,K2,s) {
        if (v === 1 || v === 0) {
            this.v = v;
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        this.secrets.w = randFr();

        const C = mimcjs.hash(mimcjs.hash(K1.x,K1.y), mimcjs.hash(K2.x, K2.y));

        if (this.v === 1) {

            this.proof.r1 = randFr();
            this.proof.d1 = randFr();

            this.commitment.A1 = (G.mul(this.proof.r1).add(newX.mul(this.proof.d1.mul(C)))).add(K1.mul(this.proof.d1));
            this.commitment.B1 = (this.H.mul(this.proof.r1).add(newY.mul(this.proof.d1.mul(C)))).add(K2.mul(this.proof.d1));

            this.commitment.A2 = G.mul(this.secrets.w);
            this.commitment.B2 = this.H.mul(this.secrets.w);
        } else if (this.v === 0) {

            this.proof.r2 = randFr();
            this.proof.d2 = randFr();

            this.commitment.A1 = G.mul(this.secrets.w);
            this.commitment.B1 = this.H.mul(this.secrets.w);

            this.commitment.A2 = (G.mul(this.proof.r2).add(newX.mul(this.proof.d2.mul(C)))).add(K1.mul(this.proof.d2));
            this.commitment.B2 = (this.H.mul(this.proof.r2).add((newY.sub(G)).mul(this.proof.d2.mul(C)))).add(K2.mul(this.proof.d2));
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        return this.commitment;
    }

    randomizerGenerateProof(cprime,c,s) {
        if (cprime instanceof Fr) {
            this.cprime = cprime;
        } else {
            this.cprime = new Fr(cprime);
        }
        if (c instanceof Fr) {
            this.c = c;
        } else {
            this.c = new Fr(c);
        }
        if (s instanceof Fr) {
            this.s = s;
        } else {
            this.s = new Fr(s);
        }

        if (this.v === 1) {
            this.proof.d2 = this.cprime.sub(this.proof.d1);
            this.proof.r2 = this.secrets.w.sub(this.proof.d2.mul(this.c).mul(this.secrets.xi)).sub(this.proof.d2.mul(this.s));
        } else if (this.v === 0) {
            this.proof.d1 = this.cprime.sub(this.proof.d2);
            this.proof.r1 = this.secrets.w.sub(this.proof.d1.mul(this.c).mul(this.secrets.xi)).sub(this.proof.d1.mul(this.s));
        } else {
            assert(false, 'vote should be either 0 or 1');
        }

        return this.proof
    }

}

exports.ProofOfVoteValidity = ProofOfVoteValidity;

function verifyRandomizerVoteValidity(H, encryptedVote, randomizerVal, commitment, _c, _cprime, proof) {
    const cprime = new Fr(_cprime);
    const c = new Fr(_c);

    if (!(cprime.equal(proof.d1.add(proof.d2)))) {
        return false;
    }

    if (!(commitment.A1.equal((G.mul(proof.r1).add(encryptedVote.X.mul(proof.d1.mul(c)))).add(randomizerVal.K1.mul(proof.d1))))) {
        return false;
    }

    if (!(commitment.B1.equal(H.mul(proof.r1).add(encryptedVote.Y.mul(proof.d1).mul(c)).add(randomizerVal.K2.mul(proof.d1))))) {
        return false;
    }

    if (!(commitment.A2.equal((G.mul(proof.r2).add(encryptedVote.X.mul(proof.d2.mul(c)))).add(randomizerVal.K1.mul(proof.d2))))) {
        return false;
    }

    if (!(commitment.B2.equal(H.mul(proof.r2).add((encryptedVote.Y.sub(G)).mul(proof.d2).mul(c)).add(randomizerVal.K2.mul(proof.d2))))) {
        return false;
    }

    return true
}

exports.verifyRandomizerVoteValidity = verifyRandomizerVoteValidity;

function verifyVoteValidity(H, encryptedVote, commitment, _c, proof) {
    // const c = new Fr(_c);
    // console.log(c.n);
    // this.c = _c
    // console.log(_c);
    // console.log((proof.d1.add(proof.d2)).n);
    // const ccc = new Frr((proof.d1.add(proof.d2)).n)
    // console.log(ccc);
    if(proof.d2 instanceof Fr){
      // console.log(proof.d2);
      // console.log(proof.d2.n + proof.d1);
      if (!(_c == proof.d2.n + proof.d1)) {
          return false;
      }
    }
    if(proof.d1 instanceof Fr){
      // console.log(proof.d1);
      // console.log(proof.d2 + proof.d1.n);
      if (!(_c == proof.d1.n + proof.d2)) {
          return false;
      }
    }

    // if (!(c.equal(proof.d1.add(proof.d2)))) {
    //     return false;
    // }

    if (!(commitment.A1.equal(G.mul(proof.r1).add(encryptedVote.X.mul(proof.d1))))) {
        return false;
    }

    if (!(commitment.B1.equal(H.mul(proof.r1).add(encryptedVote.Y.mul(proof.d1))))) {
        return false;
    }

    if (!(commitment.A2.equal(G.mul(proof.r2).add(encryptedVote.X.mul(proof.d2))))) {
        return false;
    }

    if (!(commitment.B2.equal(H.mul(proof.r2).add(encryptedVote.Y.sub(G).mul(proof.d2))))) {
        return false;
    }

    return true
}

exports.verifyVoteValidity = verifyVoteValidity;
