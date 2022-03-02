pragma solidity >=0.4.17 <0.7.0;

import "../contracts/BJJ.sol";
import "truffle/Assert.sol";


contract TestBJJ {
    function testAfOnCurve() public {
        uint256[2] memory p1 = [
            17777552123799933955779906779655732241715742912184938656739573121738514868268,
            2626589144620713026669568689430873010625803728049924121243784502389097019475
        ];
        Assert.isTrue(BJJ.afOnCurve(p1), "point should be on curve");
    }


    function testAfAdd() public {
        uint256[2] memory p1 = [
            17777552123799933955779906779655732241715742912184938656739573121738514868268,
            2626589144620713026669568689430873010625803728049924121243784502389097019475
        ];

        uint256[2] memory p = BJJ.afAdd(p1, p1);

        Assert.equal(p[0], 6890855772600357754907169075114257697580319025794532037257385534741338397365, "should add self");
        Assert.equal(p[1], 4338620300185947561074059802482547481416142213883829469920100239455078257889, "should add self");
        Assert.isTrue(BJJ.afOnCurve(p), "point should be on curve");
    }

    function testAfDouble() public {
        uint256[2] memory p1 = [
            17777552123799933955779906779655732241715742912184938656739573121738514868268,
            2626589144620713026669568689430873010625803728049924121243784502389097019475
        ];
        uint256[2] memory p = BJJ.afDouble(p1);
        Assert.equal(p[0], 6890855772600357754907169075114257697580319025794532037257385534741338397365, "should double");
        Assert.equal(p[1], 4338620300185947561074059802482547481416142213883829469920100239455078257889, "should double");
        Assert.isTrue(BJJ.afOnCurve(p), "point should be on curve");
    }

    function testAfMul() public {
        uint256[2] memory p1 = [
            17777552123799933955779906779655732241715742912184938656739573121738514868268,
            2626589144620713026669568689430873010625803728049924121243784502389097019475
        ];

        // 31 * (x1, y1)
        uint256 d = 31;
        uint256[2] memory p2 = BJJ.afMul(p1, d);
        Assert.equal(p2[0], 7622845806798279333008973964667360626508482363013971390840869953521351129788, "should multiply by 31");
        Assert.equal(p2[1], 120664075238337199387162984796177147820973068364675632137645760787230319545, "should multiply by 31");
    }

    function testCmAdd() public {
        uint256 c = 0x85CE98C61B05F47FE2EAE9A542BD99F6B2E78246231640B54595FEBFD51EB853;

        uint256 resPoint = BJJ.cmAdd(c, c);

        Assert.equal(resPoint, 0x9979273078B5C735585107619130E62E315C5CAFE683A064F79DFED17EB14E1, "should add self");
    }

    function testCmSub() public {
        uint256 c = 0x85CE98C61B05F47FE2EAE9A542BD99F6B2E78246231640B54595FEBFD51EB853;
        uint256 cc = 0x9979273078B5C735585107619130E62E315C5CAFE683A064F79DFED17EB14E1;

        uint256 resPoint = BJJ.cmSub(cc, c);

        Assert.equal(resPoint, 0x85CE98C61B05F47FE2EAE9A542BD99F6B2E78246231640B54595FEBFD51EB853, "should result in first point");
    }

    function testCmMul() public {
        uint256 c = 0x85CE98C61B05F47FE2EAE9A542BD99F6B2E78246231640B54595FEBFD51EB853;
        uint256 d = 14035240266687799601661095864649209771790948434046947201833777492504781204499;

        uint256 resPoint = BJJ.cmMul(c, d);

        Assert.equal(resPoint, 0x88E043EC729EEDEA414B63DE474C8F0930EA966733AE283E01F348CA3C35E3AB,
            "should multiply by a large number");
    }

    function testToExtended() public {
        uint256[2] memory p1 = BJJ.afG();
        uint256[4] memory resPoint = BJJ.toExtended(p1);
        uint256[4] memory exG = BJJ.exG();

        Assert.equal(resPoint[0], exG[0],
            "should equal x value");
        Assert.equal(resPoint[1], exG[1],
            "should equal y value");
        Assert.equal(resPoint[2], exG[2],
            "should equal t value");
        Assert.equal(resPoint[3], exG[3],
            "should equal z value");
    }

    function testAfCompress() public {
        // uint256[2] memory p1 = [
        //   13937045890733970672546398720335024232966706234245275758502605808695231161499,
        //   16984502085965088879562570729610415145744377788423631216622206310006666486997
        // ];
        uint256[2] memory p1 = BJJ.afG();
        uint256 resPoint = BJJ.afCompress(p1);
        uint256 cmG = BJJ.cmG();
        //uint256 ccc = 0xa58ce3340947b5d9ca9ff01aec58c4ac54757bc81d966440bdfd07725feee4d5;

        Assert.equal(resPoint, cmG,"should be equal");
    }
}
