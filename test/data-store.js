var Store = artifacts.require("./Store.sol"),
web3,contrct,contrct_address,deploy_coinbase,index_id = "Test-a",
nodes_container = function(){return [[],[],[],[],[]]},
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

  /*
    def test_exists_query_special_case(deploy_coinbase, deployed_contracts):
        grove = deployed_contracts.Grove
        index_id = grove.computeIndexId(deploy_coinbase, "test-b")

        grove.insert('test-b', 'key', 1234)

        assert grove.exists(index_id, '') is False
      });
      */

    });
