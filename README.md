# Solidity-data-store  

 `A basic database or data store using the solidity language for dynamic length ordered and un-ordered data.`

This reduces the cost attached to the process of storage, and retrieval of data, presently on the ethereum block chain.

#### insert  
`Store.insertNode(indexid, [[nodeid,data],])`

#### remove
`Store.removeNode(indexid, nodeid)`

#### fetch node data
`Store.getNode(nodeid)`

#### fetch a batch (5 nodes) from index data
`Store.getNodesBatch(indexid, last_nodeid)`
