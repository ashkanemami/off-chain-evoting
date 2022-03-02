package internal

import (
	"crypto/rand"
	"github.com/iden3/go-iden3-crypto/babyjub"
	"math/big"
)

func CreateVoterPubKeys(p int) ([]*big.Int, []*babyjub.Point) {
	var pubKeys []*babyjub.Point
	var prvKeys []*big.Int
	for i := 0; i < p; i++ {
		sk, _ := rand.Int(rand.Reader, babyjub.SubOrder)
		prvKeys = append(prvKeys, sk)
		pk := new(babyjub.Point).Mul(sk, G)
		pubKeys = append(pubKeys, pk)
	}
	return prvKeys, pubKeys
}