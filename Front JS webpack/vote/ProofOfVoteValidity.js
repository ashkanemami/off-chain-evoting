const {
	BabyJubPoint,
	G,
	Fr,
	randFr
} = require("./BabyJubPoint");
const bigInt = require("big-integer");
const assert = require('assert');
class ProofOfVoteValidity {
	constructor(H = null) {
		if (H instanceof BabyJubPoint) {
			this.H = H;
		} else {
			assert(false, 'pubkey should a BabyJubPoint');
		}
		this.encryptedVote = {
			"X": new BabyJubPoint(),
			"Y": new BabyJubPoint()
		}
		this.commitment = {
			"A1": new BabyJubPoint(),
			"B1": new BabyJubPoint(),
			"A2": new BabyJubPoint(),
			"B2": new BabyJubPoint()
		};
		this.proof = {
			"d1": bigInt.zero,
			"d2": bigInt.zero,
			"r1": bigInt.zero,
			"r2": bigInt.zero
		};
		this.secrets = {
			"xi": bigInt.zero,
			"w": bigInt.zero
		};
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
		return {
			"encryptedVote": this.encryptedVote,
			"commitment": this.commitment
		};
	}
	generateProof(c) {
		if (c instanceof Fr) {
			this.c = c;
		} else {
			this.c = new Fr(c);
		}
		if (this.v === 1) {
			this.proof.d2 = this.c.sub(this.proof.d1);
			this.proof.r2 = this.secrets.w.sub(this.secrets.xi.mul(this.proof.d2));
		} else if (this.v === 0) {
			this.proof.d1 = this.c.sub(this.proof.d2);
			this.proof.r1 = this.secrets.w.sub(this.secrets.xi.mul(this.proof.d1));
		} else {
			assert(false, 'vote should be either 0 or 1');
		}
		return this.proof
	}
}
exports.ProofOfVoteValidity = ProofOfVoteValidity;

function verifyVoteValidity(H, encryptedVote, commitment, c, proof) {
	if (!(c.equal(proof.d1.add(proof.d2)))) {
		return false;
	}
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
