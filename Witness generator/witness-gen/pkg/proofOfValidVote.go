package pkg

import "C"
import (
	"github.com/iden3/go-iden3-crypto/babyjub"
	"math/big"
	"witness-gen/internal"
)

func VerifyProofOfValidVote(R *babyjub.Point, C_ *babyjub.Point, G *babyjub.Point, Y *babyjub.Point, A1 *babyjub.Point, B1 *babyjub.Point, A2 *babyjub.Point, B2 *babyjub.Point, d1 *big.Int, d2 *big.Int, r1 *big.Int, r2 *big.Int) bool {
	ch := HashArrayPoints([]*babyjub.Point{R, C_, A1, B1, A2, B2})
	chExp := new(big.Int).Mod(new(big.Int).Add(d1, d2), babyjub.Order)
	if chExp.Cmp(ch) != 0 {
		return false
	}

	A1Exp := babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r1, G).Projective(), babyjub.NewPoint().Mul(d1, R).Projective()).Affine()
	if A1Exp.X.Cmp(A1.X) != 0 || A1Exp.Y.Cmp(A1.Y) != 0 {
		return false
	}

	B1Exp := babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r1, Y).Projective(), babyjub.NewPoint().Mul(d1, C_).Projective()).Affine()
	if B1Exp.X.Cmp(B1.X) != 0 || B1Exp.Y.Cmp(B1.Y) != 0 {
		return false
	}

	A2Exp := babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r2, G).Projective(), babyjub.NewPoint().Mul(d2, R).Projective()).Affine()
	if A2Exp.X.Cmp(A2.X) != 0 || A2Exp.Y.Cmp(A2.Y) != 0 {
		return false
	}

	O := babyjub.NewPointProjective().Add(C_.Projective(), internal.Neg(G).Projective()).Affine()
	B2Exp := babyjub.NewPointProjective().Add(babyjub.NewPoint().Mul(r2, Y).Projective(), babyjub.NewPoint().Mul(d2, O).Projective()).Affine()
	if B2Exp.X.Cmp(B2.X) != 0 || B2Exp.Y.Cmp(B2.Y) != 0 {
		return false
	}

	return true
}