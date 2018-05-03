function MyPromise(fn) {
  this.list = [];
  this.a=null;
  this.isSync = 0; // 判断是不是异步的
  fn.call(this, this.res.bind(this), this.rej.bind(this));
}

MyPromise.prototype.then = function(fn) {
  this.list.push(fn);
  return this;
};
MyPromise.prototype.res = function(value) {
  setTimeout(function(){
    this.isSync = 1;
    this.a = value;
    while (this.list.length) {
      if (typeof this.a === "object" && this.a.constructor === MyPromise) {
        this.a.list = this.a.list.concat(this.list);
        this.list.length = 0;
      } else {
        try {
          let h = this.list.shift();
          if (typeof h == "object" && h.name == "catch") {
            continue;
          }
          this.a = h(this.a);
        } catch (e) {
          while (this.list.length) {
            h = this.list.shift();
            if (typeof h == "object" && h.name == "catch") {
              h.func(e);
              this.list.length = 0;
              return;
            }
          }
          throw "你没有设置Error处理函数哦~";
        }
      }
    }
  }.bind(this),0);
};

MyPromise.prototype.rej = function(err) {
  this.isSync = 2;
  console.log(err);
};

MyPromise.prototype.catch = function(fn) {
  this.list.push({ name: "catch", func: fn });
  return this;
};

MyPromise.all=function(fns){
  let resultList=[];
  return new MyPromise(function(res,rej){
    for(let i=0;i<fns.length;i++){
      fns[i].then(function(value){
        resultList.push({index:i,value:value});
        if(resultList.length===fns.length){
          res(resultList);
        }
      })
    }
  });
}

MyPromise.race=function(fns){
  return new MyPromise(function(res,rej){
    for(let i=0;i<fns.length;i++){
      fns[i].then(function(value){
        res(value);
      })
    }
  });
}

let a = new MyPromise(function(res, rej) {
  setTimeout(function() {
    console.log("第一");
    res("第二");
  }, 1000);
});
a.then(function(value) {
    console.log("第二:", value);
    return "第三";
  })
  .catch(function(err) {
    console.log("错误：", err);
  })
  .then(function(value) {
    console.log("第三：", value);
    return "第四";
  })
  .then(function(value) {
    return new MyPromise(function(res, rej) {
      setTimeout(function() {
        console.log("新第一:", value);
        res("新第二");
      }, 1000);
    });
  })
  .then(function(value) {
    console.log("新第二:", value);
    // throw new Error("awosh wocu lw ~");
  })
  .catch(function(err) {
    console.log("hhhhhhhhh:", err);
  });


function hhhh(i){
  return new MyPromise(function(res,rej){
    setTimeout(function(){
      console.log(i,')))))')
      res(i)
    },1000)
  })
}

function hhhb(i){
  return new MyPromise(function(res,rej){
    console.log(i,'hhhhb');
    res(i);
  })
}
let listAll=[];
listAll.push(hhhb(123));
listAll.push(hhhb(456));
listAll.push(hhhb(789));
let all=MyPromise.all(listAll).then(function(v){
  console.log(v);
})

new MyPromise(function(res){
  console.log(1)
  res(2)
}).then((v)=>{
  console.log(v)
})
