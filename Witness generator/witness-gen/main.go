package main

import "C"

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	mathRand "math/rand"
	"time"
	"witness-gen/internal"
	"witness-gen/pkg"

	"github.com/iden3/go-iden3-crypto/babyjub"
)

const (
	numVotes  = 10
	treeDepth = 8
)

type hashOfBabyJubPoint struct {
	digest *big.Int
	point  *babyjub.Point
}

type MerkleTreeProof struct {
	root       *big.Int
	voterPub   *babyjub.Point
	voterID    int
	pathDigest [treeDepth]*big.Int
}

type VoteAndProof struct {
	y  *babyjub.Point
	r  *babyjub.Point
	c  *babyjub.Point
	a1 *babyjub.Point
	b1 *babyjub.Point
	a2 *babyjub.Point
	b2 *babyjub.Point
	d1 *big.Int
	d2 *big.Int
	r1 *big.Int
	r2 *big.Int
}

type signatureJson struct {
	s *big.Int
	e *big.Int
	y *babyjub.Point
	m *big.Int
}

type voteBatchJson struct {
	prevRoot   *big.Int
	prevR      *babyjub.Point
	prevC      *babyjub.Point
	nextRoot   *big.Int
	nextR      *babyjub.Point
	nextC      *babyjub.Point
	tollPub    *babyjub.Point
	voterID    [numVotes]int
	voterPub   [numVotes]*babyjub.Point
	pathDigest [numVotes][treeDepth]*big.Int
	r          [numVotes]*babyjub.Point
	c          [numVotes]*babyjub.Point
	sv         [numVotes]*big.Int
	ev         [numVotes]*big.Int
	a1         [numVotes]*babyjub.Point
	b1         [numVotes]*babyjub.Point
	a2         [numVotes]*babyjub.Point
	b2         [numVotes]*babyjub.Point
	d1         [numVotes]*big.Int
	d2         [numVotes]*big.Int
	r1         [numVotes]*big.Int
	r2         [numVotes]*big.Int
}

func printBigInt(b *big.Int, jsonEnds bool) string {
	buffer := bytes.NewBufferString(fmt.Sprintf("    \"%s\"", b.String()))
	if jsonEnds {
		buffer.WriteString("\n")
	} else {
		buffer.WriteString(",\n")
	}
	return buffer.String()
}

func printBabyJubPoint(b *babyjub.Point, jsonEnds bool) string {
	buffer := bytes.NewBufferString(fmt.Sprintf("    [\n        \"%s\",\n        \"%s\"\n    ]", b.X.String(), b.Y.String()))
	if jsonEnds {
		buffer.WriteString("\n")
	} else {
		buffer.WriteString(",\n")
	}
	return buffer.String()
}

func printBigIntArr(bArr [numVotes]*big.Int, jsonEnds bool) string {
	buffer := bytes.NewBufferString("    [\n")
	for i, b := range bArr {
		if i != len(bArr)-1 {
			buffer.WriteString(fmt.Sprintf("        \"%s\",\n", b.String()))
		} else {
			buffer.WriteString(fmt.Sprintf("        \"%s\"\n", b.String()))
		}
	}
	if jsonEnds {
		buffer.WriteString("    ]\n")
	} else {
		buffer.WriteString("    ],\n")
	}
	return buffer.String()
}

func printBabyJubPointArr(bArr [numVotes]*babyjub.Point, jsonEnds bool) string {
	buffer := bytes.NewBufferString("    [\n")
	for i, b := range bArr {
		if i != len(bArr)-1 {
			buffer.WriteString(fmt.Sprintf("        [\n            \"%s\",\n            \"%s\"\n        ],\n", b.X.String(), b.Y.String()))
		} else {
			buffer.WriteString(fmt.Sprintf("        [\n            \"%s\",\n            \"%s\"\n        ]\n", b.X.String(), b.Y.String()))
		}
	}
	if jsonEnds {
		buffer.WriteString("    ]\n")
	} else {
		buffer.WriteString("    ],\n")
	}
	return buffer.String()
}

func (o voteBatchJson) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("[\n")

	buffer.WriteString(printBigInt(o.prevRoot, false))
	buffer.WriteString(printBabyJubPoint(o.prevR, false))
	buffer.WriteString(printBabyJubPoint(o.prevC, false))

	buffer.WriteString(printBigInt(o.nextRoot, false))
	buffer.WriteString(printBabyJubPoint(o.nextR, false))
	buffer.WriteString(printBabyJubPoint(o.nextC, false))

	buffer.WriteString(printBabyJubPoint(o.tollPub, false))

	buffer.WriteString("    [\n")
	for i, v := range o.voterID {
		if i != len(o.voterID)-1 {
			buffer.WriteString(fmt.Sprintf("        \"0x%08x\",\n", v))
		} else {
			buffer.WriteString(fmt.Sprintf("        \"0x%08x\"\n", v))
		}
	}
	buffer.WriteString("    ],\n")

	buffer.WriteString(printBabyJubPointArr(o.voterPub, false))

	buffer.WriteString("    [\n")
	for j, path := range o.pathDigest {
		buffer.WriteString("        [\n")
		for i, digest := range path {
			if i != len(path)-1 {
				buffer.WriteString(fmt.Sprintf("            \"%s\",\n", digest.String()))
			} else {
				buffer.WriteString(fmt.Sprintf("            \"%s\"\n", digest.String()))
			}
		}
		if j != len(o.pathDigest)-1 {
			buffer.WriteString("        ],\n")
		} else {
			buffer.WriteString("        ]\n")
		}
	}
	buffer.WriteString("    ],\n")

	buffer.WriteString(printBabyJubPointArr(o.r, false))
	buffer.WriteString(printBabyJubPointArr(o.c, false))

	buffer.WriteString(printBigIntArr(o.sv, false))
	buffer.WriteString(printBigIntArr(o.ev, false))

	buffer.WriteString(printBabyJubPointArr(o.a1, false))
	buffer.WriteString(printBabyJubPointArr(o.a2, false))
	buffer.WriteString(printBabyJubPointArr(o.b1, false))
	buffer.WriteString(printBabyJubPointArr(o.b2, false))
	buffer.WriteString(printBigIntArr(o.d1, false))
	buffer.WriteString(printBigIntArr(o.d2, false))
	buffer.WriteString(printBigIntArr(o.r1, false))
	buffer.WriteString(printBigIntArr(o.r2, true))

	buffer.WriteString("]\n")
	return buffer.Bytes(), nil
}

func generateProofOfVoteBatch() (o voteBatchJson) {
	// random generation
	voterSK, voterPK := internal.CreateVoterPubKeys(int(math.Pow(2, treeDepth)))
	tollSK, _ := rand.Int(rand.Reader, babyjub.SubOrder)
	o.tollPub = babyjub.NewPoint().Mul(tollSK, internal.G)

	// voters and votes
	o.voterID = [numVotes]int{}
	votes := [numVotes]*babyjub.Point{}
	mathRand.Seed(time.Now().UnixNano())
	for i := range o.voterID {
		o.voterID[i] = mathRand.Intn(int(math.Pow(2, treeDepth)))
		if mathRand.Intn(2) == 0 {
			votes[i] = babyjub.NewPoint().Set(internal.I)
		} else {
			votes[i] = babyjub.NewPoint().Set(internal.G)
		}
	}

	prevT := pkg.BuildTree(voterPK)
	prevR := babyjub.NewPoint()
	prevC := babyjub.NewPoint()

	o.prevRoot = prevT.GetRoot()
	o.prevR = prevR
	o.prevC = prevC

	// update
	var updatedVoterPK []*babyjub.Point
	for i := 0; i < len(voterPK); i++ {
		updatedVoterPK = append(updatedVoterPK, voterPK[i])
	}

	o.nextR = babyjub.NewPoint().Set(prevR)
	o.nextC = babyjub.NewPoint().Set(prevC)

	for i := 0; i < len(o.voterID); i++ {
		if updatedVoterPK != nil {
			updatedVoterPK[o.voterID[i]] = nil
		}
		o.voterPub[i] = voterPK[o.voterID[i]]

		merkleProof := prevT.GetProof(o.voterID[i])

		fmt.Println("====================")
		fmt.Println(voterSK[o.voterID[i]])
		fmt.Println("====================")

		prevT.Print()

		fmt.Println("___________________________________________________________")

		prevT = pkg.BuildTree(updatedVoterPK)

		prevT.Print()

		for j := 0; j < treeDepth; j++ {
			o.pathDigest[i][j] = merkleProof[j]
		}

		o.r[i], o.c[i], o.a1[i], o.b1[i], o.a2[i], o.b2[i], o.d1[i], o.d2[i], o.r1[i], o.r2[i], _ = pkg.EncryptAndGenerateProofValidVote(votes[i], internal.G, o.tollPub)
		o.sv[i], o.ev[i] = pkg.SchnorrSign(voterSK[o.voterID[i]], pkg.HashArrayPoints([]*babyjub.Point{o.r[i], o.c[i]}), internal.G)
		o.nextR = babyjub.NewPoint().Projective().Add(o.nextR.Projective(), o.r[i].Projective()).Affine()
		o.nextC = babyjub.NewPoint().Projective().Add(o.nextC.Projective(), o.c[i].Projective()).Affine()
	}

	o.nextRoot = prevT.GetRoot()

	return o
}

func generateProofOfValidVote() (o VoteAndProof) {
	// random generation
	sk, _ := rand.Int(rand.Reader, babyjub.SubOrder)
	o.y = babyjub.NewPoint().Mul(sk, internal.G)

	vote := babyjub.NewPoint()
	if mathRand.Intn(2) == 0 {
		vote = internal.I
	} else {
		vote = internal.G
	}

	o.r, o.c, o.a1, o.b1, o.a2, o.b2, o.d1, o.d2, o.r1, o.r2, _ = pkg.EncryptAndGenerateProofValidVote(vote, internal.G, o.y)

	return o
}

func (o signatureJson) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("[\n")

	buffer.WriteString(printBigInt(o.s, false))
	buffer.WriteString(printBigInt(o.e, false))
	buffer.WriteString(printBabyJubPoint(o.y, false))
	buffer.WriteString(printBigInt(o.m, true))

	buffer.WriteString("]\n")
	return buffer.Bytes(), nil
}

func generateSignature() (o signatureJson) {
	sk, _ := rand.Int(rand.Reader, babyjub.Order)
	o.y = babyjub.NewPoint().Mul(sk, internal.G)

	o.m, _ = rand.Int(rand.Reader, babyjub.Order)

	o.s, o.e = pkg.SchnorrSign(sk, o.m, internal.G)
	return o
}

func (o VoteAndProof) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("[\n")

	buffer.WriteString(printBabyJubPoint(o.y, false))
	buffer.WriteString(printBabyJubPoint(o.r, false))
	buffer.WriteString(printBabyJubPoint(o.c, false))

	buffer.WriteString(printBabyJubPoint(o.a1, false))
	buffer.WriteString(printBabyJubPoint(o.a2, false))
	buffer.WriteString(printBabyJubPoint(o.b1, false))
	buffer.WriteString(printBabyJubPoint(o.b2, false))

	buffer.WriteString(printBigInt(o.d1, false))
	buffer.WriteString(printBigInt(o.d2, false))
	buffer.WriteString(printBigInt(o.r1, false))
	buffer.WriteString(printBigInt(o.r2, true))

	buffer.WriteString("]\n")
	return buffer.Bytes(), nil
}

func (o MerkleTreeProof) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("[\n")

	buffer.WriteString(printBigInt(o.root, false))
	buffer.WriteString(printBabyJubPoint(o.voterPub, false))
	buffer.WriteString(fmt.Sprintf("        \"0x%08x\",\n", o.voterID))
	buffer.WriteString("        [\n")
	for i, digest := range o.pathDigest {
		if i != len(o.pathDigest)-1 {
			buffer.WriteString(fmt.Sprintf("            \"%s\",\n", digest.String()))
		} else {
			buffer.WriteString(fmt.Sprintf("            \"%s\"\n", digest.String()))
		}
	}
	buffer.WriteString("        ]\n")

	buffer.WriteString("]\n")
	return buffer.Bytes(), nil
}

func generateMerkleTreeProof() (o MerkleTreeProof) {
	_, voterPK := internal.CreateVoterPubKeys(numVotes)
	prevT := pkg.BuildTree(voterPK)

	mathRand.Seed(time.Now().UnixNano())
	o.voterID = mathRand.Intn(numVotes)
	o.root = prevT.GetRoot()
	o.voterPub = voterPK[o.voterID]
	merkleProof := prevT.GetProof(o.voterID)
	for j := 0; j < treeDepth; j++ {
		o.pathDigest[j] = merkleProof[j]
	}

	return
}

func generateHashOfBabyJubPoint() (o hashOfBabyJubPoint) {
	r, _ := rand.Int(rand.Reader, babyjub.SubOrder)
	o.point = babyjub.NewPoint().Mul(r, internal.G)

	o.digest = pkg.HashArray([]*big.Int{o.point.X, o.point.Y})

	return
}

func (o hashOfBabyJubPoint) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString("[\n")

	buffer.WriteString(printBigInt(o.digest, false))
	buffer.WriteString(printBabyJubPoint(o.point, true))

	buffer.WriteString("]\n")
	return buffer.Bytes(), nil
}

func main() {
	o := generateProofOfVoteBatch()

	x, _ := json.Marshal(o)
	fmt.Println(string(x))
}
