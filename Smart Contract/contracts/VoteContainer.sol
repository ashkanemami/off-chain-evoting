pragma solidity >=0.4.17 <0.8.0;

import "./BJJ.sol";
import "./verifier0.sol";
import "./verifier.sol";

contract VoteContainer {
    // Elgamal ecrypted votes aggregated in compressed BabyJubJub points:
    // uint256[4] public totalVotesR;
    // uint256[4] public totalVotesC;
    uint256[2] public R;
    uint256[2] public C;

    // Public key which is the result of addition of public keys of decryptor parties in compressed from
    uint256[4] votingPublicKey;
    uint256 public key; //temp
    uint256 public merkleRoot;

    // Address of contract creator
    address public admin;

    // Mapping for eligibaleVoters and Decryptors
    // mapping (address => bool) eligibleVoter;
    mapping (address => bool) eligibleBulletinBoards;
    mapping (address => uint256) public decryptorPublicKey;//public
    uint8 numDecryptors;

    // Phases of the contract
    enum VotingPhases {Registration, CastingVotes, Decryption, Finished}
    VotingPhases currentPhase;

    // Events
    event ElectionEnded(uint256 result);
    event NewElectionPhase(VotingPhases);

	constructor() public {
        admin = msg.sender;
        votingPublicKey = [uint256(0), uint256(1), uint256(0), uint256(1)]; // initialize to identity element
        R = [uint256(0), uint256(1)];// initialize to identity element
        C = [uint256(0), uint256(1)];// initialize to identity element
        currentPhase = VotingPhases.Registration; // start the contract in registration phase
    }

    modifier onlyAdmin {
		require(msg.sender == admin, "Only voting admin may call this function.");
		_;
	}

    modifier onlyEligibleBulletinBoards {
		require(eligibleBulletinBoards[msg.sender], "User is not an eligible BulletinBoards");
        // Record that the voter is voting thus she is not eligible to vote again
		_;
	}

    modifier onlyEligibleDecryptors {
		require(decryptorPublicKey[msg.sender] != 0, "Not an eligible decryptor.");
        // Record that the decryptor is decrypting its part so she is not eligible to decrypt again
		_;
		decryptorPublicKey[msg.sender] = 0;
	}

    modifier duringRegistration {
		require(currentPhase == VotingPhases.Registration, "Regirtration phase is over.");
		_;
	}

    modifier duringVoteCasting {
		require(currentPhase == VotingPhases.CastingVotes, "Not in vote casting phase.");
		_;
	}

    modifier duringDecryption {
		require(currentPhase == VotingPhases.Decryption, "Not in decryption period.");
		_;
	}

    modifier whenDecrpytionFinished {
		require(currentPhase == VotingPhases.Finished, "Decryption is not finished yet.");
		_;
	}

    function addMerkleRoot(uint256 _merkleRoot) public onlyAdmin duringRegistration {
        merkleRoot = _merkleRoot;
    }

    function addDecryptorPublicKey(address decryptorAddress, uint256 _decryptorPublicKey) public onlyAdmin duringRegistration {
        //dont allow add one address twice
        decryptorPublicKey[decryptorAddress] = _decryptorPublicKey;
        votingPublicKey = BJJ.exAdd(votingPublicKey, BJJ.exDecompress(_decryptorPublicKey));
        numDecryptors++;
    }

    function addEligibleBulletinBoards(address bulletinBoardsAddress) public onlyAdmin duringRegistration {
        //dont allow add one address twice
        require(eligibleBulletinBoards[bulletinBoardsAddress] != true, "Dont allow add one address twice");
        eligibleBulletinBoards[bulletinBoardsAddress] = true;
    }

    function endRegistration() public onlyAdmin duringRegistration returns(uint256){
        currentPhase = VotingPhases.CastingVotes;
        emit NewElectionPhase(VotingPhases.CastingVotes);
        key = BJJ.exCompress(votingPublicKey);
        return key;
    }

    function endVoteCasting() public onlyAdmin duringVoteCasting {
        currentPhase = VotingPhases.Decryption;
        emit NewElectionPhase(VotingPhases.Decryption);
    }

    function castVote(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256 prevRoot, uint256[2] memory prevVoteR, uint256[2] memory prevVoteC, uint256 nextRoot, uint256[2] memory newVoteR, uint256[2] memory newVoteC) public onlyEligibleBulletinBoards duringVoteCasting {
        // check correct vote value and merkle value
        require(R[0] == prevVoteR[0] && R[1] == prevVoteR[1] , "Previous R isn't equal");
        require(C[0] == prevVoteC[0] && C[1] == prevVoteC[1] , "Previous R isn't equal");
        require(merkleRoot == prevRoot, "Previous merkle root isn't equal");
        uint256[2] memory vKey = BJJ.toAffine(votingPublicKey);
        uint256[13] memory input = [prevRoot, prevVoteR[0], prevVoteR[1], prevVoteC[0], prevVoteC[1], nextRoot, newVoteR[0], newVoteR[1], newVoteC[0], newVoteC[1], vKey[0], vKey[1], uint256(1)];
        Verifier verifyDec = new Verifier();
        require(verifyDec.verifyTx(a, b, c, input) == true, "Proof is not valid!");

       // Add the vote value to the ballots
        R = newVoteR;
        C = newVoteC;
        merkleRoot = nextRoot;

    }

    function voteDecrypt(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256 sRComressed) public  onlyEligibleDecryptors duringDecryption{
        // Prepare for ZoKrates check and create the verifier then check whether the decryption is valid
        uint256[2] memory sG = BJJ.afDecompress(decryptorPublicKey[msg.sender]); //decryptor public key
        uint256[2] memory  sR = BJJ.afDecompress(sRComressed); // decryptor multiply his secret to totalVotesR
        uint256[7] memory input = [sG[0], sG[1], R[0], R[1], sR[0], sR[1],uint256(1)];
        Verifier_0 verifyDec = new Verifier_0();
        require(verifyDec.verifyTx(a, b, c, input) == true, "Not a valid decryption");
        // Apply the decryiption contribition
        C = BJJ.afSub(C, sR);
        // finish decryption phase if there is no more decryption layers left
        numDecryptors--;
        if (numDecryptors == 0) {
            currentPhase = VotingPhases.Finished;
            emit NewElectionPhase(VotingPhases.Finished);
        }
    }

    function revealVotingResult(uint256 votingResult) public onlyAdmin whenDecrpytionFinished {
        require(BJJ.cmMul(BJJ.cmG(), votingResult) == BJJ.afCompress(C));
        emit ElectionEnded(votingResult);
        selfdestruct(address(0)); // burn if there is any eth that resides in the contract
    }
}
