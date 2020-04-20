function TestFixture(tests)
{
	this.tests = 
	[
		this.canonicalStringToTreeTest,
		this.treeToCanonicalStringTest
	];
}
{
	TestFixture.prototype.testsRun = function()
	{
		for (var i = 0; i < this.tests.length; i++)
		{
			var test = this.tests[i];
			test();
		}
	};

	TestFixture.prototype.canonicalStringToTreeTest = function()
	{
		var canonicalString = "1,1,2;B,A,C,D";

		var compressor = new CompressorHuffman();

		var symbolTree = compressor.symbolTableAsCanonicalStringToSymbolTree
		(
			canonicalString
		);

		var actual = compressor.compressBytes_4_CanonicalForm
		(
			symbolTree
		);

		var expected = canonicalString;
		if (actual != expected)
		{
			throw "CanonicalStringToTreeTest(): expected: " + expected + " but actual: " + actual;
		}
	};

	TestFixture.prototype.treeToCanonicalStringTest = function()
	{
		var compressor = new CompressorHuffman();

		var Node = CompressorHuffmanSymbolTreeNode;
		var symbolTree = new Node
		(
			"ABCD", // symbol
			0, // frequency
			null, // codeBits
			// children
			[
				new Node("B", 4, "0", []),
				new Node
				(
					"ACD", 0, null, 
					[
						new Node
						(
							"CD",
							0,
							null,
							[
								new Node("C", 2, "101", []),
								new Node("D", 1, "100", [])
							]
						),
						new Node("A", 3, "11", [])
					]
				)
			]
		);

		var actual = compressor.compressBytes_4_CanonicalForm
		(
			symbolTree
		);

		var expected = "1,1,2;B,A,C,D";
		if (actual != expected)
		{
			throw "TreeToCanonicalStringTest(): expected: " + expected + " but actual: " + actual;
		}
	};
}
