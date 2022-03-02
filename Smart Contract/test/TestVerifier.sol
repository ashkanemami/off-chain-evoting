pragma solidity >=0.4.16 <0.7.0;

import "../contracts/Verifier.sol";
import "truffle/Assert.sol";

contract TestVerifier {
    function testVerify() public {
        Verifier verifyDec = new Verifier();
        
        uint256[2] memory a = [
            uint256(0x21effaa15f5895c1988efafebf06cb9841062ecdaf77ff63d567ca71b8eaf72a),
            uint256(0x06cc11d11262be1eaf7c7e3cdd808db6c20ff69e34f60f5858acdcb7393ec6e4)
        ];
        uint256[2][2] memory b = [
            [uint256(0x0550be49561d46205b96e76ef1eb878ce9452f4d393c056d9bfead9dd602ced2),
                uint256(0x177a21b06dfd6d5a206d1b402f4e60873e866930379a450491ae675937229dda)],
            [uint256(0x01509847747064ec6998d81966cbb4a16f9ef83fa4e963af788970a7eab23710),
                uint256(0x0150d7d0a2583fbf3739523e8e0d221852ce684a4752d58fe84157919b9f332e)]
        ];
        uint256[2] memory c = [
            uint256(0x2bdcfda2f8a3fa52d03d30b9b50f5a6b523b13b66f492f8052df0769f0dd8122),
            uint256(0x2215321720ba51b48c8484f653f36bfd99fe952cac6afecbe7c2c463073237f0)
        ];
        uint[7] memory input = [
            uint256(0x1a271086992014c4bd08f01887d954f650648ad3bd4cf644e6e8421cfb2b109b),
            uint256(0x08e347c168e9303bf655c39a30fe74f21206271f1ae1274876b37fb72096ea3b),
            uint256(0x274dbce8d15179969bc0d49fa725bddf9de555e0ba6a693c6adb52fc9ee7a82c),
            uint256(0x05ce98c61b05f47fe2eae9a542bd99f6b2e78246231640b54595febfd51eb853),
            uint256(0x25bd7aefee96617d4f715ecf8e50ef9fa102eeb452642c6322d38aa9b32c2ca5),
            uint256(0x08e043ec729eedea414b63de474c8f0930ea966733ae283e01f348ca3c35e3ab),
            uint256(0x0000000000000000000000000000000000000000000000000000000000000001)
        ];
        
        Assert.equal(verifyDec.verifyTx(a, b, c, input), true, "should verify");
    }
}
