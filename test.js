var arr =
  [
    ()=>{console.log("first")},
    ()=>{console.log("second")},
    ()=>{console.log("third")},
    ()=>{console.log("fourth")}
  ];

function timeoutRecurse(funcArray){
  //Base case
  if (funcArray[0] == null){return};

  var wait = Math.floor(Math.random()*3000)+1000;
  //console.log("wait period is "+wait);

  var theFunction = funcArray[0];
  var slicedArray = funcArray.slice(1,this.length);
  theFunction();
  setTimeout(()=>{timeoutRecurse(slicedArray)}, wait);
}

timeoutRecurse(arr);
