function MyPrimise(fn) {
  this.list = [];
  this.isSync = 0; // 判断是不是异步的
  fn.call(this, this.res.bind(this), this.rej.bind(this));
}

MyPrimisFe.prototype.then = function(fn) {
  this.list.push(fn);
  return this;
};
MyPrimise.prototype.res = function(value) {
  this.isSync = 1;
  let a = value;
  let errCb = null;
  while (this.list.length) {
    if (typeof a === "object" && a.constructor === MyPrimise) {
      // 返回了一个新的myPromise对象
      a.list = a.list.concat(this.list);
      this.list.length = 0;
      if (a.isSync === 1) {
        a.res.call(a);
      } else if (a.isSync === 2) {
        a.rej.call(a);
      }
    } else {
      try {
        let h = this.list.shift();
        if (typeof h == "object" && h.name == "catch") {
          h = this.list.shift();
        }
        a = h(a);
      } catch (e) {
        while (this.list.length) {
          let h = this.list.shift();
          if (typeof h == "object" && h.name == "catch") {
            h.func(e.toString());
            this.list.length = 0;
            return;
          }
        }
        console.log("你没有设置Error处理函数~");
      }
    }
  }
};

MyPrimise.prototype.rej = function(err) {
  this.isSync = 2;
  console.log(err);
};

MyPrimise.prototype.catch = function(fn) {
  // 对连续的catch函数进行过滤
  if (typeof this.list[this.list.length - 1] === "object") {
    return this;
  }
  this.list.push({ name: "catch", func: fn });
  return this;
};

let a = new MyPrimise(function(res, rej) {
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
    return new MyPrimise(function(res, rej) {
      setTimeout(function() {
        console.log("新第一:", value);
        res("新第二");
      }, 1000);
    });
  })
  .then(function(value) {
    console.log("新第二:", value);
    throw new Error("awosh wocu lw ~");
  })
  .catch(function(err) {
    console.log("hhhhhhhhh:", err);
  });
