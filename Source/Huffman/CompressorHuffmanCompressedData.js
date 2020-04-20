function CompressorHuffmanCompressedData
(
	symbolTree,
	symbolTableAsStringCanonical,
	payloadCompressedAsBitString
)
{
	this.symbolTree = symbolTree;
	this.symbolTableAsStringCanonical = symbolTableAsStringCanonical;
	this.payloadCompressedAsBitString = payloadCompressedAsBitString;
}
{
	CompressorHuffmanCompressedData.fromBytes = function(bytes)
	{
		var reader = new ByteStream(bytes);

		var codeBitLengthCounts = [];
		var codeBitLengthMax = reader.readByte();
		for (var i = 0; i < codeBitLengthMax; i++)
		{
			var codeBitLengthCount = reader.readByte();
			codeBitLengthCounts.push(codeBitLengthCount);
		}
		var codeBitLengthCountsAsString = codeBitLengthCounts.join(",");

		var symbolCount = reader.readByte();
		var symbolsAsBytes = reader.readBytes(symbolCount);
		var symbolsAsStringsHexadecimal = symbolsAsBytes.map(x => x.toString(16));
		var symbolsAsString = symbolsAsStringsHexadecimal.join(",");

		var symbolTableAsStringCanonical =
			codeBitLengthsAsString + ";" + symbolsAsString;

		var bitsOfPaddingOnLastByte = reader.readByte();
		var payloadCompressedAsBytes = reader.readBytesToEnd();
		var payloadCompressedAsBitString = "";
		for (var i = 0; i < payloadCompressedAsBytes.length; i++)
		{
			var payloadByte = payloadCompressedAsBytes[i];
			var payloadBits = payloadByte.toString(2);
			payloadCompressedAsBitString += payloadBits;
		}
		payloadCompressedAsBitString =
			payloadCompressedAsBitString.substr
			(
				0, payloadCompressedAsBitString.length - bitsOfPaddingOnLastByte
			);

		var returnValue = new CompressorHuffmanCompressedData
		(
			symbolTableAsStringCanonical,
			payloadCompressedAsBitString
		);
	};

	CompressorHuffmanCompressedData.prototype.toBytes = function()
	{
		var returnBytes = [];

		var codeLengthCountsAndSymbolsAsString = this.symbolTableAsStringCanonical.split(";");

		var codeLengthCountsAsString = codeLengthCountsAndSymbolsAsString[0];
		var codeLengthCountsAsStrings = codeLengthCountsAsString.split(",");
		var codeLengthCounts = codeLengthCountsAsStrings.map(x => parseInt(x));

		var symbolsAsString = codeLengthCountsAndSymbolsAsString[1];
		var symbolsAsStrings = symbolsAsString.split(",");

		// todo

		return returnBytes;
	};
}
