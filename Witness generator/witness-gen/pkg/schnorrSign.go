package pkg

import (
	"crypto/rand"
	"github.com/iden3/go-iden3-crypto/babyjub"
	"math/big"
)

// SchnorrSign Sign returns the Schnorr signature for the message and private key
func SchnorrSign(x *big.Int, m *big.Int, G *babyjub.Point) (s *big.Int, e *big.Int) {
	k, _ := rand.Int(rand.Reader, babyjub.SubOrder)

	r := babyjub.NewPoint().Mul(k, G)
	e = HashArray([]*big.Int{r.X, r.Y, m})
	s = new(big.Int).Mod(new(big.Int).Sub(k, new(big.Int).Mul(x, e)), babyjub.SubOrder)
	return s, e
}