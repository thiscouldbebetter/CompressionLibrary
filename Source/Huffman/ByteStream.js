
function ByteStream(bytes)
{
	this.bytes = bytes;
	this.byteIndexCurrent = 0;
}
{
	ByteStream.prototype.readByte = function()
	{
		var byteRead = this.bytes[this.byteIndexCurrent];
		this.byteIndexCurrent++;
		return byteRead;
	};

	ByteStream.prototype.readBytes = function(byteCount)
	{
		var returnBytes = [];

		for (var i = 0; i < byteCount; i++)
		{
			var byteRead = this.readByte();
			returnBytes.push(byteRead);
		}

		return returnBytes;
	};

	ByteStream.prototype.readBytesToEnd = function()
	{
		var bytesRemaining = this.bytes.length - this.byteIndexCurrent;
		var returnBytes = this.readBytes(bytesRemaining);
		return returnBytes;
	};
}
