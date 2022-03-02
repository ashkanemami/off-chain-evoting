package pkg

import (
	"fmt"
	"github.com/iden3/go-iden3-crypto/babyjub"
	"math/big"
	"strings"
)

// BuildTree recursively builds the merkle tree, bottom-first. It makes a nodelist for each level until it results in
// 1 node, meaning we reached the root node.
func BuildTree(parts []*babyjub.Point) Tree {
	var nodes []Node
	var i int
	for i = 0; i < len(parts); i += 2 {
		if i + 1 < len(parts) {
			if parts[i] == nil && parts[i+1] == nil {
				nodes = append(nodes, Node{left: EmptyBlock{}, right: EmptyBlock{}})
			} else if parts[i] == nil {
				nodes = append(nodes, Node{left: EmptyBlock{}, right: Leaf{Point: parts[i+1]}})
			} else if parts[i+1] == nil {
				nodes = append(nodes, Node{left: Leaf{Point: parts[i]}, right: EmptyBlock{}})
			} else {
				nodes = append(nodes, Node{left: Leaf{Point: parts[i]}, right: Leaf{Point: parts[i+1]}})
			}
		} else {
			if parts[i] == nil {
				nodes = append(nodes, Node{left: EmptyBlock{}, right: EmptyBlock{}})
			} else {
				nodes = append(nodes, Node{left: Leaf{Point: parts[i]}, right: EmptyBlock{}})
			}
		}
	}
	if len(nodes) == 1 {
		return nodes
	} else if len(nodes) > 1 {
		return BuildUpperLevel(nodes)
	} else {
		panic("Error")
	}
}

func BuildUpperLevel(parts []Node) []Node {
	var nodes []Node
	var i int
	for i = 0; i < len(parts); i += 2 {
		if i + 1 < len(parts) {
			nodes = append(nodes, Node{left: parts[i], right: parts[i+1]})
		} else {
			nodes = append(nodes, Node{left: parts[i], right: EmptyBlock{}})
		}
	}
	if len(nodes) == 1 {
		return nodes
	} else if len(nodes) > 1 {
		return BuildUpperLevel(nodes)
	} else {
		panic("Error")
	}
}

type Tree []Node

type hashable interface {
	hash() *big.Int
}

type MerkleTip struct {
	*babyjub.Point
}

type Leaf MerkleTip

func (l Leaf) hash() *big.Int {
	return HashArray([]*big.Int{l.X, l.Y})
}

func (l Leaf) String() string {
	return fmt.Sprintf("{X: %s, y: %s}", l.X.String(), l.Y.String())
}

func (t Tree) Print() {
	t[0].Print(0)
}

func (t Tree) Depth() int {
	d := 0
	n := t[0]
	for ;; {
		if l, ok := n.left.(Node); ok {
			n = l
			d++
		} else {
			d++
			break
		}
	}
	return d
}

func (t Tree) GetLeaf(id int) Leaf {
	d := t.Depth()
	n := t[0]
	for ;; {
		d--
		if (id & (1 << d)) == 0 {
			if l, ok := n.left.(Node); ok {
				n = l
			} else if l, ok := n.left.(Leaf); ok {
				return l
			} else {
				return Leaf{nil}
			}
		} else {
			if l, ok := n.right.(Node); ok {
				n = l
			} else if l, ok := n.right.(Leaf); ok {
				return l
			} else {
				return Leaf{nil}
			}
		}
	}
}


func (t Tree) GetProof(id int) []*big.Int {
	d := t.Depth()
	n := t[0]
	var proof []*big.Int
	for ;; {
		d--
		if (id & (1 << d)) == 0 {
			proof = append([]*big.Int{n.right.hash()}, proof...)
			if _, ok := n.left.(Leaf); ok {
				return proof
			} else if _, ok := n.left.(EmptyBlock); ok {
				return nil
			} else if l, ok := n.left.(Node); ok {
				n = l
			}
		} else {
			proof = append([]*big.Int{n.left.hash()}, proof...)
			if _, ok := n.right.(Leaf); ok {
				return proof
			} else if _, ok := n.right.(EmptyBlock); ok {
				return nil
			} else if l, ok := n.right.(Node); ok {
				n = l
			}
		}
	}
}

func (t Tree) GetRoot() *big.Int {
	return t[0].hash()
}

type EmptyBlock struct {
}

func (_ EmptyBlock) hash() *big.Int {
	o, _ := new(big.Int).SetString("0", 10)
	return o
}

type Node struct {
	left  hashable
	right hashable
}

func (n Node) hash() *big.Int {
	var l, r *big.Int
	l = n.left.hash()
	r = n.right.hash()
	return HashArray([]*big.Int{l, r})
}

func (n Node) Print(level int) {
	fmt.Printf("(%d) %s %s\n", level, strings.Repeat("    ", level), n.hash().String())
	if l, ok := n.left.(Node); ok {
		l.Print(level+1)
	} else if l, ok := n.left.(Leaf); ok {
		fmt.Printf("(%d) %s %s (data: %s)\n", level + 1, strings.Repeat("    ", level + 1), l.hash().String(), l.String())
	}
	if r, ok := n.right.(Node); ok {
		r.Print(level+1)
	} else if r, ok := n.right.(Leaf); ok {
		fmt.Printf("(%d) %s %s (data: %s)\n", level + 1, strings.Repeat("    ", level + 1), r.hash().String(), r.String())
	}
}
