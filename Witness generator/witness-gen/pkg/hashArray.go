package pkg

import (
	"github.com/iden3/go-iden3-crypto/babyjub"
	"github.com/iden3/go-iden3-crypto/constants"
	"github.com/iden3/go-iden3-crypto/mimc7"
	"github.com/iden3/go-iden3-crypto/utils"
	"math/big"
)

// HashArray performs the MIMC7 hash over a *big.Int array with only 10 rounds and key equal to 0
func HashArray(arr []*big.Int) *big.Int {
	if !utils.CheckBigIntArrayInField(arr) {
		return nil
	}
	var r *big.Int
	r = big.NewInt(0)
	for i := 0; i < len(arr); i++ {
		r = new(big.Int).Add(
			new(big.Int).Add(
				r,
				arr[i],
			),
			mimc7.MIMC7HashGeneric(arr[i], r, 10))
		r = new(big.Int).Mod(r, constants.Q)
	}
	return r
}

func HashArrayPoints(arrPoints []*babyjub.Point) (*big.Int) {
	var arr []*big.Int
	for i := 0; i < len(arrPoints); i++ {
		arr = append(arr, arrPoints[i].X)
		arr = append(arr, arrPoints[i].Y)
	}

	if !utils.CheckBigIntArrayInField(arr) {
		return nil
	}

	var r *big.Int
	r = big.NewInt(0)
	for i := 0; i < len(arr); i++ {
		r = new(big.Int).Add(
			new(big.Int).Add(
				r,
				arr[i],
			),
			mimc7.MIMC7HashGeneric(arr[i], r, 10))
		r = new(big.Int).Mod(r, constants.Q)
	}
	return r
}


