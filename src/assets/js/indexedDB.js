/**
 * IndexDB数据库管理类
 * 采用了单例模式
 * 调用时用 IndexDB.getInstance(dbName)
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB
 * TODO 版本号怎么管理
 * TODO 如何创建新的数据库
 * TODO 如何创建新的表、更新表结构 -- 有问题？
 */
// COMPAT_ENVS = [
//   ['Firefox', ">= 16.0"],
//   ['Google Chrome',
//     ">= 24.0 (you may need to get Google Chrome Canary), NO Blob storage support"]
// ];
export default class IndexDB {
  /**
   * 构造函数
   * 传参
   */
  constructor(dbName) {
    console.log("IndexDB constructor. ");
    // super(props);
    this.dbName = dbName;
    if (!this.isSupport()) {
      console.log("您的浏览器不支持indexedDB.");
    }
  }

  /**
   * 单例模式
   * 静态方法
   * @returns {IndexDB}
   */
  static getInstance(dbName) {
    console.log("getInstance begins. ");
    if (!this.instance) {
      console.log("getInstance this.instance is empty. ");
      this.instance = new IndexDB(dbName);
    }
    return this.instance;
  }

  /**
   * 检查浏览器是否支持
   * indexedDB兼容
   * 注意： indexedDB 对象在旧版本的浏览器上是带有前缀的
   * (在 Gecko < 16的情况下是 mozIndexedDB 属性，Chrome 中是 webkitIndexedDB ，以及IE10 的 msIndexedDB )
   * 要注意的是使用前缀的实现可能会有问题，或者是实现的并不完整，也可能遵循的还是旧版的规范。因此不建议在生产环境中使用。
   * 我们更倾向于明确的不支持某一浏览器，而不是声称支持但是实际运行中却出问题:
   * @returns {boolean}
   */
  isSupport() {
    console.log("checkSupport begins. ");
    // In the following line, you should include the prefixes of implementations you want to test.
    this.indexedDb =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    this.transaction =
      window.IDBTransaction ||
      window.webkitIDBTransaction ||
      window.msIDBTransaction;
    this.keyRange =
      window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    if (!this.indexedDb) {
      console.log("你的浏览器不支持indexDB,请更换浏览器");
      return false;
    } else {
      console.log("你的浏览器支持indexDB");
      // console.log("isSuport this.indexedDb is ", this.indexedDb);
      return true;
    }
  }

  /**
   * 创建或打开数据库
   * 新建数据库与打开数据库是同一个操作。如果指定的数据库不存在，就会新建。
   * 不同之处在于，后续的操作主要在 upgradeneeded事件的监听函数里面完成，因为这时版本从无到有，所以会触发这个事件。
   */
  openDB() {
    return new Promise((resolve, reject) => {
      // 第一个参数是数据库的名称，第二个参数是数据库的版本号。
      // 版本号可以在升级数据库时用来调整数据库结构和数据
      console.log("openDB this.dbName is " + this.dbName);
      //  打开我们的数据库
      // 在 IndexedDB 中的大部分异步方法做的都是同样的事情 - 返回一个包含 result 或错误的 IDBRequest 对象。
      // open 函数的结果是一个 IDBDatabase 对象的实例。
      //  这个方法接受两个参数，第一个参数是字符串，表示数据库的名字。
      //  如果指定的数据库不存在，就会新建数据库。
      //  第二个参数是整数，表示数据库的版本。
      //  如果省略，打开已有数据库时，默认为当前版本；新建数据库时，默认为1。
      //  这里打开时省略第二个参数。
      const openRequest = this.indexedDb.open(this.dbName);
      console.log("openRequest this.indexedDb.open(). ");
      console.log("openRequest is ", openRequest);
      // 打开数据库
      // 如果没有版本号变化，而且页面之前被打开过，你会获得一个onsuccess事件。
      // 如果有错误发生时则触发onerror事件。如果你之前没有关闭连接，则会触发onblocked事件。
      openRequest.onsuccess = () => {
        console.log("openDB indexedDB.open success.");
        // Better use "this" than "req" to get the result to avoid problems with
        // garbage collection.
        // db = req.result;
        // console.log("openRequest is ", openRequest);
        // 此处采用异步通知. 在使用curd的时候请通过事件触发;
        this.db = openRequest.result;
        this.dbVersion = this.db.version;
        resolve();
      };
      // 通常，新建数据库以后，第一件事是新建对象仓库（即新建表）。
      // onupgradeneeded事件在第一次打开页面初始化数据库时会被调用，或在当有版本号变化时。
      // 增加数据库版本号时，会触发onupgradeneeded事件，这时可能会出现成功、失败和阻止事件三种情况。
      // 所以，你应该在onupgradeneeded函数里创建你的存储数据。
      openRequest.onupgradeneeded = event => {
        console.log("openDB indexDB.open() onupgradeneeded begins. ");
        // console.log("openRequest is ", openRequest);
        this.db = event.target.result;
        this.dbVersion = this.db.version;
        // 初始化创建数据库时，添加默认的表user。
        // 主键（key）是默认建立索引的属性。比如，数据记录是 { id: 1, name: '张三'}，那么 id属性可以作为主键。
        // 主键也可以指定为下一层对象的属性，比如 {foo: { bar: 'baz' } }的 foo.bar也可以指定为主键。
        const configs = {
          keyPath: "id",
          autoIncrement: true
        };
        this.db.createObjectStore("models", configs);
        resolve();
      };
      openRequest.onerror = event => {
        console.log(
          "openDB this.indexDb.open error. 不能打开数据库,错误信息: ",
          event
        );
        reject(event);
        // return event;
      };
    });
  }

  /**
   * 创建数据库的表格（或者叫数据库仓库）
   * @param dbStoreName
   * @param configs
   * configs = {
   *  keyPath: "id",
   *  autoIncrement: true
   * }
   */
  createStore(dbStoreName, configs) {
    console.log("createStore dbStoreName is ", dbStoreName);
    // console.log("this.instance is ", this.instance);
    return new Promise((resolve, reject) => {
      console.log("createStore this.openDB  response . ");
      console.log("createStore this.db is ", this.db);
      const storeNames = this.db.objectStoreNames;
      console.log("storeNames is ", storeNames);
      if (!storeNames.contains(dbStoreName)) {
        // 添加表时，必须修改版本号。
        console.log("!storeNames.contains(dbStoreName)");
        console.log("this.indexedDb is ", this.indexedDb);
        console.log("this.dbName is " + this.dbName);
        const dbVersion = this.db.version + 1;
        const openRequest = this.indexedDb.open(this.dbName, dbVersion);
        console.log("createStore openRequest opened. ");
        console.log("createStore openRequest is ", openRequest);

        openRequest.onsuccess = () => {
          console.log("createStore indexedDB.open success.");
          this.db = openRequest.result;
          resolve();
        };
        // 增加数据库版本号时，会触发onupgradeneeded事件，这时可能会出现成功、失败和阻止事件三种情况。
        // onupgradeneeded事件在第一次打开页面初始化数据库时会被调用，或在当有版本号变化时。
        // 所以，你应该在onupgradeneeded函数里创建你的存储数据。
        openRequest.onupgradeneeded = event => {
          console.log("createStore indexDB.open onupgradeneeded begins. ");
          this.db = event.target.result;
          // this.db = openRequest.result; // 不用这种方式， ？？？
          // 初始化创建数据库时，添加默认的表user。
          // const configs = {
          //   keyPath: "id",
          //   autoIncrement: true
          // };
          if (!this.db.objectStoreNames.contains(dbStoreName)) {
            this.db.createObjectStore(dbStoreName, configs);
          }
          resolve();
        };
        openRequest.onerror = event => {
          console.log(
            "this.indexDb.open error. 不能打开数据库,错误信息: ",
            event
          );
          reject();
        };
      }
    });
  }

  /**
   * 删除数据库
   * @param dbName
   * @param callback
   */
  deleteDB(dbName, callback) {
    const deleteQuest = this.indexedDb.deleteDatabase(dbName);
    console.log("数据库已关闭");
    deleteQuest.onerror = function() {
      console.log("删除数据库出错");
    };
    deleteQuest.onsuccess = function() {
      if (callback && typeof callback === "function") {
        callback();
      }
    };
  }

  /**
   * 关闭数据库
   */
  closeDB() {
    //关闭数据库
    this.dbName.close();
    console.log("数据库已关闭");
  }

  getDbVersion() {
    return new Promise((resolve, reject) => {
      const dbOpenRequest = this.indexedDb.open(this.dbName);
      dbOpenRequest.onsuccess = () => {
        this.db = dbOpenRequest.result;
        console.log("this.db.version is " + this.db.version);
        resolve(this.db.version);
      };
      dbOpenRequest.onerror = () => {
        console.log("getDbVersion error. ");
        reject();
      };
    });
  }

  /**
   * 此处须显式声明事务, 事务只有一次，每次需要重新获得事务
   * 第二个参数可以省略
   * transaction() 方法接受两个参数（一个是可选的）并返回一个事务对象。
   * 第一个参数是事务希望跨越的对象存储空间的列表。
   * 如果你希望事务能够跨越所有的对象存储空间你可以传入一个空数组。
   * 如果你没有为第二个参数指定任何内容，你得到的是只读事务。
   * 如果你想写入数据，你需要传入 "readwrite" 标识。
   * @param {string} dbStoreName
   * @param {string} mode
   * @returns {IDBObjectStore}
   */
  getObjectStore(dbStoreName, mode = "readwrite") {
    console.log("getObjectStore dbStoreName is " + dbStoreName);
    console.log("this.db is ", this.db);
    const transaction = this.db.transaction(dbStoreName, mode);
    // // 在所有数据添加完毕后的处理
    // transaction.oncomplete = function(event) {
    //   console.log("All done! event is ", event);
    // };
    //
    // transaction.onerror = function(event) {
    //   // 不要忘记错误处理！
    //   console.log("transaction onerror. event is ", event)
    // };
    return transaction.objectStore(dbStoreName);
  }

  /**
   * 清除整个对象存储(表)
   * @param store_name
   */
  clearObjectStore(store_name) {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(store_name, "readwrite");
      const req = store.clear();
      req.onsuccess = function(evt) {
        console.log("Store cleared. event is ", evt);
        console.log(store);
        resolve();
      };
      req.onerror = function(evt) {
        console.error("clearObjectStore: ", evt.target.errorCode);
        console.log(this.error);
        reject(this.error);
      };
    });
  }

  /**
   * 由于indexDB的操作为异步操作，因此用Promise对象进行包装一下
   * @param payload
   * @returns {Promise<any>}
   * @constructor
   */
  Add(payload) {
    return new Promise((resolve, reject) => {
      let db = this.indexedDb.open("hb_geocode");
      db.onsuccess = () => {
        db.result
          .transaction("geo", "readwrite")
          .objectStore("geo")
          .add(payload);
        db.result.close(); // 是否每次操作都要断开？？？
        resolve();
      };
      db.onerror = e => {
        reject(e);
      };
    });
  }
  read(dbStoreName, key) {
    const request = this.getObjectStore(dbStoreName).get(key);

    request.onerror = () => {
      console.log("事务失败");
    };

    request.onsuccess = () => {
      if (request.result) {
        // console.log("Name: " + request.result.name);
        // console.log("Age: " + request.result.age);
        // console.log("Email: " + request.result.email);
        console.log("read res is ", request.result);
      } else {
        console.log("未获得数据记录");
      }
    };
  }
  /**
   * 增加单条数据操作
   * @param data
   * @param dbStoreName
   */
  addData(dbStoreName, data) {
    console.log("addData begins. ");
    console.log("addData this.openDB runtime. ");
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(dbStoreName).add(data);
      request.onsuccess = function() {
        console.log("数据写入成功");
        resolve();
      };
      request.onerror = function(event) {
        console.log("数据写入失败", event);
        reject(this.error);
      };
    });
  }
  /**
   * 删除数据
   */
  delete(key, dbStoreName) {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(dbStoreName).delete(key);
      request.onsuccess = function() {
        console.log("result: ", request.result);
        console.log("删除成功");
        resolve();
      };
      request.onerror = function() {
        reject(this.error);
      };
    });
  }
  /**
   * 新增、编辑操作
   */
  update(dbStoreName, data) {
    console.log("update begins.  dbStoreName is " + dbStoreName);
    return new Promise((resolve, reject) => {
      // 把更新过的对象放回数据库
      const requestUpdate = this.getObjectStore(dbStoreName).put(data);
      requestUpdate.onsuccess = function() {
        // 完成，数据已更新！
        console.log("编辑成功"); // 更新成功？？？
        resolve();
      };
      requestUpdate.onerror = function(event) {
        // 错误处理
        console.log("update error", event);
        reject(this.error);
      };
    });
  }
  /**
   * 查询操作
   */
  select(dbStoreName, key = "") {
    console.log("indexDB select begins. dbStoreName is " + dbStoreName);
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(dbStoreName);
      let request;
      if (key) {
        request = store.get(key);
      } else {
        request = store.getAll();
      }
      request.onsuccess = () => {
        console.log("select request.result is ", request.result);
        resolve(request.result);
      };
      request.onerror = event => {
        reject(event);
      };
    });
  }

  //  查询所有数据
  getAlldata(dbStoreName) {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(dbStoreName).getAll();
      request.onsuccess = function() {
        console.log("查询成功");
        console.log(request.result);
        resolve(this.result);
      };
      request.onerror = function() {
        reject(this.error);
      };
    });
  }
}
//
// const dbObject = {};
// dbObject.init = function(params) {
//   this.dbName = params.dbName;
//   this.dbVersion = params.dbVersion;
//   this.dbStoreName = params.dbStoreName;
//   if (!window.indexedDB) {
//     window.console.log("你的浏览器不支持IndexDB,请更换浏览器");
//   }
//
//   var request = indexedDB.open(this.dbName, this.dbVersion);
//   //打开数据失败
//   request.onerror = function(event) {
//     console.log("不能打开数据库,错误代码: " + event.target.errorCode);
//   };
//   request.onupgradeneeded = function(event) {
//     this.db = event.target.result;
//     this.db.createObjectStore(dbObject.dbStoreName);
//   };
//   //打开数据库
//   request.onsuccess = function(event) {
//     //此处采用异步通知. 在使用curd的时候请通过事件触发
//     dbObject.db = event.target.result;
//     console.log("indexDB连接成功");
//   };
// };
// /**
//  * 增加和编辑操作
//  */
// dbObject.put = function(params, key) {
//   //此处须显式声明事物
//   var transaction = dbObject.db.transaction(
//     dbObject.dbStoreName,
//     "readwrite"
//   );
//   var store = transaction.objectStore(dbObject.dbStoreName);
//   var request = store.put(params, key);
//   request.onsuccess = function() {
//     console.log("添加成功");
//   };
//   request.onerror = function(event) {
//     console.log(event);
//   };
// };
// /**
//  * 删除数据
//  */
// dbObject.delete = function(id) {
//   // dbObject.db.transaction.objectStore is not a function
//   const request = dbObject.db
//     .transaction(dbObject.dbStoreName, "readwrite")
//     .objectStore(dbObject.dbStoreName)
//     .delete(id);
//   request.onsuccess = function() {
//     console.log("删除成功");
//   };
// };
//
// /**
//  * 查询操作
//  */
// dbObject.select = function(key) {
//   //第二个参数可以省略
//   var transaction = dbObject.db.transaction(
//     dbObject.dbStoreName,
//     "readwrite"
//   );
//   var store = transaction.objectStore(dbObject.dbStoreName);
//   let request;
//   if (key) {
//     request = store.get(key);
//   } else {
//     request = store.getAll();
//   }
//
//   request.onsuccess = function() {
//     console.log(request.result);
//   };
// };
// /**
//  * 清除整个对象存储(表)
//  */
// dbObject.clear = function() {
//   var request = dbObject.db
//     .transaction(dbObject.dbStoreName, "readwrite")
//     .objectStore(dbObject.dbStoreName)
//     .clear();
//   request.onsuccess = function() {
//     console.log("清除成功");
//   };
// };
// //  查询所有数据
// dbObject.getAlldata = function() {
//   var request = dbObject.db
//     .transaction(dbObject.dbStoreName, "readwrite")
//     .objectStore(dbObject.dbStoreName)
//     .getAll();
//   request.onsuccess = function() {
//     console.log("查询成功");
//     console.log(request.result);
//   };
// };
// // window.dbObject = dbObject;
// export default dbObject;
