class MyPromise {
  constructor(func) {
    this.list = [];
    setTimeout(() => {
      func(this.resolve.bind(this), this.reject.bind(this));
    }, 0);
  }
  resolve(data) {
    let msg = data;
    while (this.list.length) {
      if (this._isMyPromise(msg)) {
        msg.list = msg.list.concat(this.list);
        this.list.length = 0;
      } else {
        const func = this.list.shift();
        if (this._isErrorCallBack(func)) {
          continue;
        }
        try {
          msg = func.call(null, msg);
        } catch (e) {
          this.reject(e);
        }
      }
    }
  }
  reject(error) {
    while (this.list.length) {
      const catchFunc = this.list.shift();
      if (this._isErrorCallBack(catchFunc)) {
        catchFunc.errorCallback(error);
        break;
      }
    }
    throw error;
  }
  then(cb) {
    if (this._isFunction(cb)) {
      this.list.push(cb);
    }
    return this;
  }
  catch(cb) {
    if (this._isFunction(cb)) {
      this.list.push({
        errorCallback: cb
      });
    }
    return this;
  }
  _isFunction(func) {
    return typeof func === 'function';
  }
  _isErrorCallBack(func) {
    return typeof func == 'object' && this._isFunction(func.errorCallback);
  }
  _isMyPromise(msg) {
    return typeof msg === 'object' && msg.constructor === MyPromise;
  }
}
MyPromise.all = function(fns) {
  const len = fns.length;
  let reslen = 0;
  const result = [];
  return new MyPromise((res, rej) => {
    fns.forEach((el, i) => {
      el.then(data => {
        reslen++;
        result[i] = data;
        if (len === reslen) {
          res(result);
        }
      }).catch(e => {
        rej(e);
      });
    });
  });
};
MyPromise.race = function() {};

// test code
// new MyPromise((res, rej) => {
//   if (Math.random() > 0.5) {
//     res(1);
//   } else {
//     rej('我只是一个粗哟五');
//   }
// })
//   .then(data => {
//     console.log(data);
//     console.log('2');
//   })
//   .then(() => {
//     return new MyPromise(res => {
//       console.log('hhhhh');
//       setTimeout(() => {
//         console.log('哈哈哈哈哈');
//         res('1111');
//       }, 3000);
//     }).then(data => {
//       console.log(data);
//     });
//   })
//   .then(() => {
//     console.log('3');
//   });
let a = new MyPromise(function(res, rej) {
  setTimeout(function() {
    console.log('第一');
    res('第二');
  }, 1000);
});
a.then(function(value) {
  console.log('第二:', value);
  return '第三';
})
  .catch(function(err) {
    console.log('错误：', err);
  })
  .then(function(value) {
    console.log('第三：', value);
    return '第四';
  })
  .then(function(value) {
    return new MyPromise(function(res, rej) {
      setTimeout(function() {
        console.log('新第一:', value);
        res('新第二');
      }, 1000);
    });
  })
  .then(function(value) {
    console.log('新第二:', value);
  })
  .catch(function(err) {
    console.log('hhhhhhhhh:', err);
  });

