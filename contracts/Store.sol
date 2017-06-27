pragma solidity^0.4.10;

contract Store{


    struct Node{
        bytes32 id;
        bytes32 left;
        bytes32 right;
        bytes32 data;
    }

    struct Index{
        bytes32 root;
        bytes32 last;
        uint size;
        mapping(bytes32=>Node) nodes;
    }

    mapping(bytes32=>Index) index_lookup;
    mapping(bytes32=>bytes32) nodes_to_index;

    //event newIndex(bytes32);

    function nodeExists(bytes32 index_id,bytes32 node_id) constant returns(bool){
        return (nodes_to_index[node_id] == index_id);
    }

    function getIndex(bytes32 index_id) constant returns(bytes32,bytes32,uint){
        return (index_lookup[index_id].root,index_lookup[index_id].last,index_lookup[index_id].size);
    }

    function getIndexId(bytes32 node_id) constant returns(bytes32){
        return nodes_to_index[node_id];
    }

    function getNode(bytes32 node_id)constant returns(bytes32,bytes32,bytes32,bytes32){
        bytes32 index_id = nodes_to_index[node_id];
        Node memory current_node = index_lookup[index_id].nodes[node_id];
        return(current_node.id,current_node.left,current_node.right,current_node.data);
    }

    function getNodesBatch(bytes32 index_id,bytes32 last_node_id)constant returns(bytes32[5][4] memory results){
        Index storage index = index_lookup[index_id];

        //return empty array if empty
        if(index.size<1)
        return(results);

        //Choose node to begin fetching from
        if(last_node_id == 0x0)last_node_id = index.root;
        else last_node_id = index.nodes[last_node_id].right;

        uint r = 0;
        while(r<5 && last_node_id!=0x0){
         results[0][r]= index.nodes[last_node_id].id;
         results[1][r]= index.nodes[last_node_id].left;
         results[2][r]= index.nodes[last_node_id].right;
         results[3][r]= index.nodes[last_node_id].data;
         r++;
         if(index.nodes[last_node_id].right == 0x0)
         break;
         else last_node_id = index.nodes[last_node_id].right;
        }
    }

    function insertNodes(bytes32 index_id,bytes32[2][5] nodes_data) {
        //Nodes_data[id,data]
        Index storage index = index_lookup[index_id];
        bytes32 left_node;
        bytes32 right_node;
        bytes32 node_id;

        for(uint n = 0;n<nodes_data.length;n++){
            if(nodes_data[n][0] == 0x0) continue;
                node_id = nodes_data[n][0];
              if(n==0){
                if(index.root==0x0){
                    index.root = node_id;
                    left_node = 0x0;
                }
                else{
                    left_node = index.last;
                }
              }
              else{
                left_node = nodes_data[n-1][0];
              }

            right_node = 0x0;

            nodes_to_index[node_id] = index_id;
            index.nodes[node_id] = Node(node_id,left_node,right_node,nodes_data[n][1]);
            index.size++;

            //update previous node
            if(left_node!=0x0)
            index.nodes[left_node].right = node_id;

        }
        index.last = node_id;

    }

    function removeNode(bytes32 index_id,bytes32 node_id) nodeIndexMatches(node_id,index_id) indexNotEmpty(index_id){

        Index storage index = index_lookup[index_id];
        bytes32 left_node = index.nodes[node_id].left;
        bytes32 right_node = index.nodes[node_id].right;

        //Update new root if root node
        if(index.root == node_id)
        index.root = right_node;
        //Update left and right reference of node
        if(index.root != node_id)
        index.nodes[left_node].right = right_node;
        if(right_node!= 0x0)
        index.nodes[right_node].left = left_node;
        //Update index.last if last
        if(index.last == node_id)
        index.last = left_node;

        //Update size and delete componnts
        index.size--;
        delete(nodes_to_index[node_id]);
        delete(index.nodes[node_id]);
    }

    modifier nodeIndexMatches(bytes32 node_id, bytes32 index_id){
        require(index_id == nodes_to_index[node_id]);
        _;
    }

    modifier indexNotEmpty(bytes32 index_id){
        require(index_lookup[index_id].size>0);
        _;
    }
}
