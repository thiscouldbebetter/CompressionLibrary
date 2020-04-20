
function CompressorHuffman()
{
	// Do nothing.
}
{
	CompressorHuffman.prototype.compressBytes = function(bytesToCompress)
	{
		var symbolToFrequencyLookup = 
			this.compressBytes_1_SymbolToFrequencyLookup
			(
				bytesToCompress
			);

		var symbolTreeNodesAndLookup = 
			this.compressBytes_2_TreeNodesForSymbols
			(
				symbolToFrequencyLookup
			);

		var treeNodesForSymbols = symbolTreeNodesAndLookup[0];
		var symbolToTreeNodeLookup = symbolTreeNodesAndLookup[1];

		var symbolTreeNonCanonical =
			this.compressBytes_3_SymbolTree
			(
				treeNodesForSymbols
			);

		var symbolTreeAsStringCanonical =
			this.compressBytes_4_CanonicalForm
			(
				symbolTreeNonCanonical
			);

		// hack - Convert the symbol tree back from string to ensure it's in canonical form.
		var symbolTree = this.symbolTableAsCanonicalStringToSymbolTree
		(
			symbolTreeAsStringCanonical
		);
		/*
		var isSymbolTreeValid = symbolTree.isValid();
		if (isSymbolTreeValid == false)
		{
			alert("Invalid symbol tree from canonical string!");
		}
		*/

		symbolTree.parentsAssignToDescendants();
		symbolTree.codeCalculateForSelfAndDescendants();
		// hack - And convert the lookup back as well.
		symbolToTreeNodeLookup = symbolTree.toLookup([]);

		var payloadCompressedAsBitString =
			this.compressBytes_5_BitString
			(
				bytesToCompress, symbolToTreeNodeLookup
			);

		var compressedData = new CompressorHuffmanCompressedData
		(
			symbolTree,
			symbolTreeAsStringCanonical,
			payloadCompressedAsBitString
		);

		return compressedData;
	};

	CompressorHuffman.prototype.compressBytes_1_SymbolToFrequencyLookup = function
	(
		bytesToCompress
	)
	{
		var symbolToFrequencyLookup = {};

		for (var i = 0; i < bytesToCompress.length; i++)
		{
			var symbol = bytesToCompress[i];
			var frequencyOfSymbol = symbolToFrequencyLookup[symbol];
			if (frequencyOfSymbol == null)
			{
				frequencyOfSymbol = 0;
			}
			frequencyOfSymbol++;
			symbolToFrequencyLookup[symbol] = frequencyOfSymbol;
		}

		return symbolToFrequencyLookup;
	};

	CompressorHuffman.prototype.compressBytes_2_TreeNodesForSymbols = function(
		symbolToFrequencyLookup
	)
	{
		var treeNodesForSymbols = [];
		var symbolToTreeNodeLookup = {};

		for (var symbolAsString in symbolToFrequencyLookup)
		{
			var symbol = parseInt(symbolAsString);
			var frequencyOfSymbol = symbolToFrequencyLookup[symbol];
			var treeNodeForSymbol = new CompressorHuffmanSymbolTreeNode
			(
				symbol,
				frequencyOfSymbol,
				null, // codeBitsAsString
				[] // children
			);

			symbolToTreeNodeLookup[symbol] = treeNodeForSymbol;

			// todo - Streamline sorting.
			var i;
			for (i = 0; i < treeNodesForSymbols.length; i++)
			{
				var treeNodeExisting = treeNodesForSymbols[i];
				if (frequencyOfSymbol <= treeNodeExisting.frequency)
				{
					break;
				}
			}

			treeNodesForSymbols.splice(i, 0, treeNodeForSymbol);
		}

		var symbolTreeNodesAndLookup = [ treeNodesForSymbols, symbolToTreeNodeLookup ];

		return symbolTreeNodesAndLookup;
	};

	CompressorHuffman.prototype.compressBytes_3_SymbolTree = function
	(
		treeNodesForSymbols
	)
	{
		var treeNodeParent;

		while (treeNodesForSymbols.length > 1)
		{
			var treeNodesWithFrequenciesLeast = 
			[
				treeNodesForSymbols[0],
				treeNodesForSymbols[1]
			];

			treeNodesForSymbols.splice(0, 1);
			treeNodesForSymbols.splice(0, 1);

			var sumOfFrequencies = 
				treeNodesWithFrequenciesLeast[0].frequency
				+ treeNodesWithFrequenciesLeast[1].frequency;

			treeNodeParent = new CompressorHuffmanSymbolTreeNode
			(
				null, // symbol
				sumOfFrequencies, // frequency
				null, // codeBitsAsString
				treeNodesWithFrequenciesLeast // children
			)

			var i;
			for (i = 0; i < treeNodesForSymbols.length; i++)
			{
				var treeNodeExisting = treeNodesForSymbols[i];
				if (sumOfFrequencies <= treeNodeExisting.frequency)
				{
					break;
				}
			}
			treeNodesForSymbols.splice(i, 0, treeNodeParent);
		}

		treeNodeParent.codeCalculateForSelfAndDescendants();

		return treeNodeParent;
	};

	CompressorHuffman.prototype.compressBytes_4_CanonicalForm = function(symbolTree)
	{
		// Based on section 3.3.2 of the DEFLATE specification at the URL
		// https://tools.ietf.org/html/rfc1951.

		// For additional explanation, also see:
		// https://zlib.net/feldspar.html
		// https://pineight.com/mw/index.php?title=Canonical_Huffman_code

		// Also, try https://en.wikipedia.org/wiki/Canonical_Huffman_code.

		var symbolTreeNodesAsList = symbolTree.leafNodesAddToList([]);
		var symbolsAndCodes = symbolTreeNodesAsList.map
		(
			node => [ node.symbol, node.codeBitsAsString ]
		);

		var symbolsAndCodesSortedAlphabetically = symbolsAndCodes.sort
		(
			(x, y) => x[0] > y[0]
		);

		var symbolsAndCodesSortedByLengthThenAlpha =
			symbolsAndCodesSortedAlphabetically.sort
			(
				(x, y) => x[1].length - y[1].length
			);

		var symbolsAndCodesGroupedByCodeLength =
			symbolsAndCodesSortedByLengthThenAlpha.reduce
			(
				function(groupsByCodeLength, symbolAndCode)
				{
					var code = symbolAndCode[1];
					var codeLength = code.length;
					var groupForCodeLength = groupsByCodeLength[codeLength];
					if (groupForCodeLength == null)
					{
						groupForCodeLength = [];
						groupsByCodeLength[codeLength] = groupForCodeLength;
					}
					groupForCodeLength.push(symbolAndCode);
					return groupsByCodeLength;
				}, 
				[] // groupsByCodeLength
			);

		for (var i = 1; i < symbolsAndCodesGroupedByCodeLength.length; i++)
		{
			if (symbolsAndCodesGroupedByCodeLength[i] == null)
			{
				symbolsAndCodesGroupedByCodeLength[i] = [];
			}
		}

		var codeLengthCounts = symbolsAndCodesGroupedByCodeLength.map
		(
			x => x.length
		).slice(1);
		var codeLengthCountsAsString = codeLengthCounts.join(",");
		var symbolsSortedAsNumbers = symbolsAndCodesSortedByLengthThenAlpha.map
		(
			symbolAndCode => symbolAndCode[0].toString()
		);
		var symbolsSortedAsString = symbolsSortedAsNumbers.join(",");

		var codeLengthCountsAndSymbolsSortedAsString =
			codeLengthCountsAsString + ";" + symbolsSortedAsString;

		return codeLengthCountsAndSymbolsSortedAsString;
	};

	CompressorHuffman.prototype.compressBytes_5_BitString = function
	(
		bytesToCompress, symbolToTreeNodeLookup
	)
	{
		var bitsEncodedAsString = "";

		for (var i = 0; i < bytesToCompress.length; i++)
		{
			var symbol = bytesToCompress[i];
			var treeNodeCurrent = symbolToTreeNodeLookup[symbol];
			var code = treeNodeCurrent.codeBitsAsString;
			bitsEncodedAsString += code;
		}

		return bitsEncodedAsString;
	};

	CompressorHuffman.prototype.decompressSymbolTreeAndBitStringIntoSymbols = function
	(
		symbolTreeRoot, bitsToDecode
	)
	{
		var symbolsDecompressed = [];

		var treeNodeCurrent = symbolTreeRoot;

		for (var b = 0; b < bitsToDecode.length; b++)
		{
			var bitCurrent = bitsToDecode[b];
			treeNodeCurrent = treeNodeCurrent.children[bitCurrent];

			if (treeNodeCurrent.children.length == 0)
			{
				var symbol = treeNodeCurrent.symbol;
				symbolsDecompressed.push(symbol);
				treeNodeCurrent = symbolTreeRoot;
			}
		}

		return symbolsDecompressed;
	};

	CompressorHuffman.prototype.symbolTableAsCanonicalStringToSymbolTree = function
	(
		symbolTableAsCanonicalString
	)
	{
		// Based on section 3.3.2 of the DEFLATE specification at the URL
		// https://tools.ietf.org/html/rfc1951.

		// For additional explanation, also see:
		// https://zlib.net/feldspar.html
		// https://pineight.com/mw/index.php?title=Canonical_Huffman_code

		var codeBitLengthCountsAndSymbolsAsStrings =
			symbolTableAsCanonicalString.split(";");

		var codeBitLengthCountsAsString =
			codeBitLengthCountsAndSymbolsAsStrings[0];
		var symbolsAsString =
			codeBitLengthCountsAndSymbolsAsStrings[1];

		var symbolsAsStrings = symbolsAsString.split(",");
		var symbolCountsByBitLengthAsStrings =
			codeBitLengthCountsAsString.split(",");

		var symbols = symbolsAsStrings; //.map(x => parseInt(x));
		var symbolCountsByBitLength = symbolCountsByBitLengthAsStrings.map
		(
			x => parseInt(x)
		);

		symbolCountsByBitLength.splice(0, 0, 0);
		var nextCodesByBitLength = [ 0 ];
		var nextCodeForBitLength = 0;
		for (var i = 1; i <= symbolCountsByBitLength.length; i++)
		{
			var symbolCountForBitLengthPrev =
				symbolCountsByBitLength[i - 1] || 0;

			nextCodeForBitLength =
				(nextCodeForBitLength + symbolCountForBitLengthPrev) << 1; 

			nextCodesByBitLength.push(nextCodeForBitLength);
		}

		var symbolAndCodePairs = [];

		for (var i = 0; i < symbolCountsByBitLength.length; i++)
		{
			var bitLength = i;
			var symbolCountForBitLength = symbolCountsByBitLength[i];

			var nextCodeForBitLength =
				nextCodesByBitLength[bitLength];

			for (var s = 0; s < symbolCountForBitLength; s++)
			{
				var symbol = symbols[symbolAndCodePairs.length];
				var codeForSymbol = nextCodeForBitLength.toString(2).padStart
				(
					bitLength, "0"
				);

				nextCodeForBitLength++;

				var symbolAndCode = [ symbol, codeForSymbol ];
				symbolAndCodePairs.push(symbolAndCode);
			}
		}

		var symbolTree =
			CompressorHuffmanSymbolTreeNode.fromSymbolCodePairs
			(
				symbolAndCodePairs
			);

		return symbolTree;
	};

	CompressorHuffman.prototype.toString = function()
	{
		var treeAsString = this.treeRoot.toString("");

		var bitsAsString = "";
		for (var b = 0; b < this.bitsEncoded.length; b++)
		{
			var bitCurrent = this.bitsEncoded[b];
			bitsAsString += bitCurrent;
		}

		var returnValue = treeAsString;
		returnValue += bitsAsString;

		return returnValue;
	};
}
