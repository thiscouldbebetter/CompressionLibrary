function CompressorHuffmanSymbolTreeNode(symbol, frequency, codeBitsAsString, children)
{
	this.symbol = symbol;
	this.frequency = frequency;
	this.codeBitsAsString = codeBitsAsString;
	this.children = children || [];

	this.parentsAssignToDescendants();
}
{
	// Static methods.

	CompressorHuffmanSymbolTreeNode.fromSymbolCodePairs = function(symbolCodePairs)
	{
		var root = new CompressorHuffmanSymbolTreeNode();
		for (var p = 0; p < symbolCodePairs.length; p++)
		{
			var symbolAndCode = symbolCodePairs[p];

			var symbol = symbolAndCode[0];
			var code = symbolAndCode[1];

			var nodeCurrent = root;

			for (var b = 0; b < code.length; b++)
			{
				var codeBit = code[b];
				var children = nodeCurrent.children;
				if (children[codeBit] == null)
				{
					nodeCurrent = new CompressorHuffmanSymbolTreeNode
					(
						symbol, // symbol
						null, // frequency
						code, // codeBitsAsString
						[] // children
					);
					children[codeBit] = nodeCurrent;
				}
				else
				{
					nodeCurrent = children[codeBit];
				}
			}
			//nodeCurrent.symbol = symbol;
		}

		return root;
	};

	// Instance methods.

	CompressorHuffmanSymbolTreeNode.prototype.isValid = function()
	{
		var hasASymbolButIsNotALeaf = (this.symbol != null && this.children.length > 0);
		var isValidSoFar = (hasASymbolButIsNotALeaf == false);

		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			if (child.isValid() == false)
			{
				isValidSoFar = false;
				break;
			}
		}

		return isValidSoFar;
	};

	CompressorHuffmanSymbolTreeNode.prototype.parentsAssignToDescendants = function()
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.parent = this;
			child.parentsAssignToDescendants();
		}
	};

	CompressorHuffmanSymbolTreeNode.prototype.parentsClearFromDescendants = function()
	{
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			delete child.parent;
			child.parentsClearFromDescendants();
		}
	};

	CompressorHuffmanSymbolTreeNode.prototype.code = function()
	{
		var codeSoFar = "";

		var nodeCurrent = this;

		while (nodeCurrent != null)
		{
			var nodeParent = nodeCurrent.parent;

			if (nodeParent != null)
			{
				var bit = nodeParent.children.indexOf(nodeCurrent);
				codeSoFar = "" + bit + codeSoFar;
			}

			nodeCurrent = nodeParent;
		}

		return codeSoFar;
	};

	CompressorHuffmanSymbolTreeNode.prototype.codeCalculateForSelfAndDescendants = function()
	{
		this.codeBitsAsString = this.code();
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.codeCalculateForSelfAndDescendants();
		}
	}

	CompressorHuffmanSymbolTreeNode.prototype.leafNodesAddToList = function
	(
		listToAddTo
	)
	{
		if (this.children.length == 0)
		{
			listToAddTo.push(this);
		}

		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.leafNodesAddToList(listToAddTo);
		}

		return listToAddTo;
	};

	CompressorHuffmanSymbolTreeNode.prototype.toLookup = function(lookup)
	{
		lookup[this.symbol] = this;
		
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.toLookup(lookup);
		}
		
		return lookup;
	}

	// JSON.

	CompressorHuffmanSymbolTreeNode.assignPrototypesToTreeObject = function(treeAsObject)
	{
		// Converts a generic object into a tree of typed nodes.
		treeAsObject.__proto__ = CompressorHuffmanSymbolTreeNode.prototype;
		var children = treeAsObject.children;
		for (var i = 0; i < children.length; i++)
		{
			var child = children[i];
			CompressorHuffmanSymbolTreeNode.assignPrototypesToTreeObject(child);
		}
	};

	CompressorHuffmanSymbolTreeNode.fromStringJson = function(treeAsJson)
	{
		var treeAsObject = JSON.parse(treeAsJson);
		CompressorHuffmanSymbolTreeNode.assignPrototypesToTreeObject(treeAsObject);
		return treeAsObject;
	};

	CompressorHuffmanSymbolTreeNode.prototype.toStringJson = function()
	{
		this.parentsClearFromDescendants(); // JSON.stringify can't handle circular references.

		var returnValue = JSON.stringify
		(
			this,
			null, // ?
			2 // indent level
		); 

		this.parentsAssignToDescendants();

		return returnValue;
	};
}
