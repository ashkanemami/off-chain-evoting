package pkg

import "C"
import (
	"crypto/rand"
	"errors"
	"github.com/iden3/go-iden3-crypto/babyjub"
	"math/big"
	"witness-gen/internal"
)

// ElgamalEnc returns the encryption of message m with public key y
func ElgamalEnc(G *babyjub.Point, Y *babyjub.Point, M *babyjub.Point) (R *babyjub.Point, C *babyjub.Point, r *big.Int) {
	r, _ = rand.Int(rand.Reader, babyjub.SubOrder)

	R = babyjub.NewPoint().Mul(r, G)
	C = babyjub.NewPoint().Projective().Add(babyjub.NewPoint().Mul(r, Y).Projective(), M.Projective()).Affine()

	return
}

// EncryptAndGenerateProofValidVote Encrypts the vote and generates proof that the vote is either 0 or 1
func EncryptAndGenerateProofValidVote(vote *babyjub.Point, G *babyjub.Point, Y *babyjub.Point) (R *babyjub.Point, C_ *babyjub.Point, A1 *babyjub.Point, B1 *babyjub.Point, A2 *babyjub.Point, B2 *babyjub.Point, d1 *big.Int, d2 *big.Int, r1 *big.Int, r2 *big.Int, err error) {
	r, _ := rand.Int(rand.Reader, babyjub.SubOrder)

	R = babyjub.NewPoint().Mul(r, G)
	C_ = babyjub.NewPoint().Projective().Add(babyjub.NewPoint().Mul(r, Y).Projective(), vote.Projective()).Affine()

	w, _ := rand.Int(rand.Reader, babyjub.SubOrder)

	if babyjub.NewPoint().X.Cmp(vote.X) == 0 && babyjub.NewPoint().Y.Cmp(vote.Y) == 0 {
		r2, _ = rand.Int(rand.Reader, babyjub.SubOrder)
		d2, _ = rand.Int(rand.Reader, babyjub.SubOrder)

		A1 = babyjub.NewPoint().Mul(w, G)
		B1 = babyjub.NewPoint().Mul(w, Y)

		O := babyjub.NewPoint().Projective().Add(C_.Projective(), internal.Neg(G).Projective()).Affine()

		A2 = babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r2, G).Projective(), babyjub.NewPoint().Mul(d2, R).Projective()).Affine()
		B2 = babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r2, Y).Projective(), babyjub.NewPoint().Mul(d2, O).Projective()).Affine()

		ch := HashArrayPoints([]*babyjub.Point{R, C_, A1, B1, A2, B2})

		d1 = new(big.Int).Mod(new(big.Int).Sub(ch, d2), internal.FieldOrder())
		r1 = new(big.Int).Mod(new(big.Int).Sub(w, new(big.Int).Mod(new(big.Int).Mul(d1, r), babyjub.SubOrder)), babyjub.SubOrder)

		return
	} else if G.X.Cmp(vote.X) == 0 && G.Y.Cmp(vote.Y) == 0 {
		r1, _ = rand.Int(rand.Reader, babyjub.SubOrder)
		d1, _ = rand.Int(rand.Reader, babyjub.SubOrder)

		A1 = babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r1, G).Projective(), babyjub.NewPoint().Mul(d1, R).Projective()).Affine()
		B1 = babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r1, Y).Projective(), babyjub.NewPoint().Mul(d1, C_).Projective()).Affine()

		A2 = babyjub.NewPoint().Mul(w, G)
		B2 = babyjub.NewPoint().Mul(w, Y)

		ch := HashArrayPoints([]*babyjub.Point{R, C_, A1, B1, A2, B2})

		d2 = new(big.Int).Mod(new(big.Int).Sub(ch, d1), internal.FieldOrder())
		r2 = new(big.Int).Mod(new(big.Int).Sub(w, new(big.Int).Mod(new(big.Int).Mul(d2, r), babyjub.SubOrder)), babyjub.SubOrder)

		return
	}

	return nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, errors.New("malformed vote value")
}
