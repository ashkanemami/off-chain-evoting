package internal

import (
	"github.com/iden3/go-iden3-crypto/babyjub"
	"github.com/iden3/go-iden3-crypto/utils"
	"math/big"
)

var I *babyjub.Point
var G *babyjub.Point

// init initializes global values.
func init() {
	I = babyjub.NewPoint()
	G = babyjub.NewPoint()
	G.X = utils.NewIntFromString("16540640123574156134436876038791482806971768689494387082833631921987005038935")
	G.Y = utils.NewIntFromString("20819045374670962167435360035096875258406992893633759881276124905556507972311")
}

func FieldOrder() (o *big.Int) {
	o, _ = new(big.Int).SetString("21888242871839275222246405745257275088548364400416034343698204186575808495617", 10)
	return o
}

// Neg negates the value of the Point c
func Neg(c *babyjub.Point) *babyjub.Point {
	p := new(babyjub.Point)
	p.X = new(big.Int).Neg(c.X)
	p.Y = new(big.Int).Set(c.Y)
	return p
}