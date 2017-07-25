var Store = artifacts.require("./Store.sol"),
web3,contrct,contrct_address,deploy_coinbase,deleted,index_id = "Test-a",
nodes_container = function(){return [[],[],[],[],[]]},
nodes_object_container = function(){return [{},{},{},{},{}]},
tree_nodes = {
    'a': 18,
    'b': 0,
    'c': 7,
    'd': 11,
    'e': 16,
    'f': 3,
    'g': 16,
    'h': 17,
    'i': 17,
    'j': 18,
    'k': 12,
    'l': 3,
    'm': 4,
    'n': 6,
    'o': 11,
    'p': 5,
    'q': 12,
    'r': 1,
    's': 1,
    't': 16,
    'u': 14,
    'v': 3,
    'w': 7,
    'x': 13,
    'y': 6,
    'z': 17,
}

contract('Data-Store', function(accounts) {
  deploy_coinbase = accounts[0];


  it("should deploy Store Contract", function() {
    var store = Store.deployed();
    return store.then(function(instance) {
      contrct = instance;
      web3 = instance.constructor.web3
      web3.utils = web3._extend.utils;
      contrct_address = instance.address;

      assert.notEqual(contrct.address, null, "Store not deployed!!");
      console.log("Store deployed at "+contrct_address)
    });
  })

  it("Should create one new index",function(done){
      var tr="a",
      nc = new nodes_container;
      nc[0] = [tr,tree_nodes[tr]];

        contrct.nodeExists.call(index_id,tr)
        .then(function(e1){
          assert.equal(e1,false,"Node e1 exists in Index before insertion");
        })
        .then(function(a){
          contrct.insertNodes(index_id,nc)
          .then(function(a){
            console.log("Insertion cost:",a.receipt.gasUsed);
            contrct.nodeExists.call(index_id,tr)
            .then(function(e2){
              assert.equal(e2,true,"Node e2 does not exist in Index after insertion");
              crossCheck();
            })
          });
        })
        //Double check presence
        function crossCheck(){
          contrct.nodeExists.call(index_id,tr)
          .then(function(e3){
            assert.equal(e3,true,"Node e3 does not exist in Index after insertion");
            sanityCheck();
          });
        }
        //Sanity check
        function sanityCheck(){
          s="cc";
        contrct.nodeExists.call(index_id,s)
        .then(function(e4){
          assert.equal(e4,false,"Node e4:"+s+" exists without insertion");
          done();
        });
      }
    });


  it("Should create batches of new indexes",function(done){
      var i = [],final,indexes = Object.keys(tree_nodes);

      indexes = indexes.splice(1);//Remove already added index;
      //delete(indexes[0]);

      for(ind=0;ind<indexes.length;ind+=5){
        //Check if first in batch already exists
        (function(indx){
        var sc,tr=indexes[indx];
        return sc = contrct.nodeExists.call(index_id,tr)
        .then(function(e1){
          assert.equal(e1,false,"Node e1 (first node in batch) exists in Index before insertion");
        })
        .then(function(){
          var to_add = new nodes_container();
          for(t_a=0;t_a<5;t_a++){
            to_add[t_a] = [indexes[indx+t_a],tree_nodes[indexes[indx+t_a]]];
          }

          i[tr] = contrct.insertNodes(index_id,to_add)
          .then(function(a){
            console.log("Insertion cost:",a.receipt.gasUsed);
            contrct.nodeExists.call(index_id,tr)
            .then(function(e2){
              assert.equal(e2,true,"Node e2 does not exist in Index after insertion");
            })
            if(!(indx+5<indexes.length))crossCheck();
          });
        })
      })(ind);
      }

    function crossCheck(){
        // Make sure it still registers as having all of the nodes.
        for(ind=0;ind<indexes.length;ind+=5){
          (function(indx){
          var tr = indexes[indx];
          i[tr].then(function(){
            contrct.nodeExists.call(index_id,tr)
            .then(function(e3){
              assert.equal(e3,true,"Node e3 does not exist in Index after insertion");
              if(!(indx+5<indexes.length))sanityCheck();//Run sanity after last crosscheck
            });
          });
        })(ind);
        };
    }

    function sanityCheck(){
        // Sanity check
        ['aa', 'tsra', 'arst', 'bb', 'cc'].forEach(function(s){
          (function(n){
          contrct.nodeExists.call(index_id,s)
          .then(function(e4){
            assert.equal(e4,false,"Node e4 exists without insertion");
            if(n=='cc')done();
          });
        })(s);
          });
      }

        });

    it("Should remove a random Index",function(){

        var keys = Object.keys(tree_nodes);
        deleted = keys[Math.floor(keys.length*Math.random())];
        console.log("Chosen Node:",deleted);

        return contrct.nodeExists.call(index_id,deleted).
        then(function(r1){

          assert.equal(r1,true,"Node does not exist for removal");

          contrct.removeNode(index_id,deleted)
          .then(function(r2){
            console.log("Deletion cost:",r2.receipt.gasUsed);

            contrct.nodeExists.call(index_id,deleted)
            .then(function(r3){
              assert.equal(r3,false,"Node still exists after removal");
          })
        })
      });
    })

    it("Should fetch a random node from the Index",function(){

      var keys = Object.keys(tree_nodes),
      node_id = keys[Math.floor(keys.length*Math.random())];
      console.log("Chosen Node(Fetch):",node_id);
      return contrct.nodeExists.call(index_id,node_id)
      .then(function(e){
        if(node_id == deleted)
        assert.equal(false,e,"Deleted node should not exist");
        else
          assert.equal(true,e,"Inserted node does not exist");
      })
      .then(function(){
        contrct.getNode.call(node_id)
        .then(function(f){
          console.log(f,web3.fromAscii(node_id));
          //assert.equal(true,e,"Inserted node does not exist");
        })
      })

    });

      it("Should fetch all nodes on the Index",function(done){
        var nodes = [],last_node=0x0;
        contrct.getIndex.call(index_id)
        .then(function(index){
          size = Number(index[2]);

          function fetchNode(){
          contrct.getNodesBatch.call(index_id,last_node)
          .then(function(nodes_batch){
              var all=new nodes_object_container,l=0,
              titles = ['id','left','rigt','data'];
              nodes_batch.forEach(function(r){

                var rn=0;
                r.forEach(function(c){
                  all[rn][titles[l]] = c;
                  rn++;
                });
                l++;
              });
                nodes = nodes.concat(all);

            last_node=nodes[nodes.length-1].id;
            if(last_node==web3.toHex(0x0) || !(nodes.length<size)){
              console.log(nodes);
              done();
            }
            else fetchNode();
          });
          }

         fetchNode();
        })
      })


    });
