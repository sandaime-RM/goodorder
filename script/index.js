// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getDatabase, get, onValue, set, ref, push, update, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOaLUpb_VKtW2bFiXGqW1yiAI8JI1LM18",
  authDomain: "goodorder-mtr.firebaseapp.com",
  projectId: "goodorder-mtr",
  storageBucket: "goodorder-mtr.appspot.com",
  databaseURL: "https://goodorder-mtr-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "128494381595",
  appId: "1:128494381595:web:bd4466a8f7f531a614e6be",
  measurementId: "G-FQFPTFGX52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getDatabase(app);

var shopData;
var items = [];

//HTML
var orderModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
  keyboard: false
})

const auth = getAuth();
var uid;

//ログイン状態の取得
onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      uid = user.uid;
      // ...
      document.getElementById("loginBtn").innerHTML = "<img src='"+user.photoURL+"' class='rounded-pill' width='40' onclick='logout()'>";

      //店舗データを取得
      onValue(ref(db, "users/" + uid), (snapshot) => {
        shopData = snapshot.val();
        //店舗設定なしの場合、店舗設定画面に遷移
        if(!shopData) {window.location.href="store.html";}

        console.log(shopData.info.nextNum)

        //店名・クラブ名の表示
        document.getElementById("shopName").textContent = shopData.info.shopName;
        document.getElementById("clubName").textContent = shopData.info.clubName;

        //商品リストを取得し、注文追加フォームに表示
        items = shopData.info.items;
        document.getElementById("orderList").innerHTML = "";

        Object.keys(items).forEach((key, index) => {
          document.getElementById("orderList").innerHTML += '<div class="row mb-4"><div class="col-7 fs-4">'+items[key].name+' <span class="text-secondary small">￥'+items[key].price+'</span></div><div class="col-5 fs-5"><div class="input-group"><button class="btn btn-outline-secondary fs-5 fw-bold" type="button" id="button-addon'+index+'" onclick="changeNum('+index+', -1)">－</button><input type="number" value="0" class="form-control text-center fs-5" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon'+index+'" id="item_'+index+'" ><button class="btn btn-outline-secondary fs-5 fw-bold" type="button" id="button-addon'+index+'" onclick="changeNum('+index+', 1)">＋</button></div></div></div>';
        });

        //新しい注文の番号を表示
        document.getElementById("nextNum").textContent = ( '000' + shopData.info.nextNum ).slice( -3 );

        //注文数・売上高の表示
        var earningTotal = 0;
        if(shopData.orders) {
          Object.keys(shopData.orders).forEach(order => {
            earningTotal += Number(shopData.orders[order].price);
          });

          document.getElementById("orderTotal").textContent = Object.keys(shopData.orders).length;
          document.getElementById("earningTotal").textContent = earningTotal.toLocaleString();

          dispOrders();
        }

        document.getElementById("loading").style.display = "none";
        
      });

      dispClock();

      //時刻の表示
      setInterval(dispClock, 10000);
    } else {
        alert("ログインが必要です。");
        document.getElementById("loading").style.display = "none";
    }
});


function dispClock() {
  var date = new Date();
  document.getElementById("minute").textContent = ( '0' + date.getMinutes() ).slice( -2 );
  document.getElementById("hour").textContent = ( '0' + date.getHours() ).slice( -2 );
}


//注文の追加
//数量の変更
function changeNum(item, diff) {
  var newNum = Number(document.getElementById("item_" + item).value) + diff;

  if(newNum < 0) {newNum = 0;}

  document.getElementById("item_" + item).value = newNum;

  dispPrice();
}

window.changeNum = changeNum;
export{changeNum}

//注文の送信
function sendOrder() {
  var buyItems = {}
  var date = new Date();
  var totalPrice = 0;
  var currentNum = shopData.info.nextNum;
  var customerTypes = [];

  Object.keys(items).forEach((key, index) => {
    buyItems[key] = Number(document.getElementById("item_" + index).value);
    totalPrice += items[key].price * Number(document.getElementById("item_" + index).value)
  });

  //顧客情報の登録
  for(var i=0; i<=8; i++) {
    customerTypes[i] = document.getElementById("check" + (i+1)).checked;
  }

  push(ref(db, "users/" + uid + "/orders"), {
    comment : "",
    items : buyItems,
    time : date.getTime(),
    status : 1,
    price : totalPrice,
    number : currentNum,
    customerTypes : customerTypes
  });

  set(ref(db, "users/" + uid + "/info/nextNum"), (Number(shopData.info.nextNum) + 1))
  .then(() => {
    orderModal.hide();
    makeQR(uid, currentNum);

    //顧客情報のチェックを外す
    for(var i=0; i<=8; i++) {
      document.getElementById("check" + (i+1)).checked = false;
    }
  });
}

window.sendOrder = sendOrder;
export{sendOrder}

//合計金額の表示
function dispPrice() {
  var totalPrice = 0;

  Object.keys(items).forEach((key, index) => {
    totalPrice += items[key].price * Number(document.getElementById("item_" + index).value)
  });

  console.log(totalPrice)

  document.getElementById("totalPrice").textContent = totalPrice.toLocaleString();
}

window.dispPrice = dispPrice;
export{dispPrice}


//注文一覧の表示
function dispOrders() {
  document.getElementById("orderWaiting").innerHTML = '<div class="col-lg-3 py-3" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#exampleModal"><div class="card py-5 shadow-sm px-3 border-3" style="border-style: dashed;"><div class="text-center" style="color: #bbb;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg><p class="py-3 my-0">注文を追加</p></div></div></div>';
  document.getElementById("orderDone").innerHTML = "";

  Object.keys(shopData.orders).forEach((key, index) => {
    var itemList = "";

    Object.keys(shopData.orders[key].items).forEach((key2, index2) => {
      if(shopData.orders[key].items[key2] == 0) {return;}
      itemList += "<li class='list-group-item'><div class='row'><div class='col-9'>"+shopData.info.items[key2].name+"</div><div class='col-3'>"+shopData.orders[key].items[key2]+"</div></div></li>"
    });

    //「待機」に表示
    if(shopData.orders[key].status == 1) {
      document.getElementById("orderWaiting").innerHTML += '<div class="col-lg-3 py-3"><div class="card shadow "><div class="card-body"><div class="fs-3 text-center fw-bold text-secondary">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div><ul class="list-group my-2 mb-3">'+itemList+'</ul><button class="btn btn-outline-primary" onclick="changeStatus('+index +', 2)">完成</button><button class="ms-2 btn btn-outline-danger" onclick="del('+index +')">削除</button></div></div></div>'
    }

    //「呼び出し済み」に表示
    if(shopData.orders[key].status == 2) {
      document.getElementById("orderDone").innerHTML += '<div class="col-lg-3 py-3"><div class="card shadow border-success"><div class="card-body"><div class="fs-3 text-center fw-bold text-success">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div><ul class="list-group my-2 mb-3">'+itemList+'</ul><button class="btn btn-outline-primary" onclick="changeStatus('+index +', 3)">終了</button><button class="ms-2 btn btn-outline-danger" onclick="del('+index +')">削除</button><button class="ms-2 btn btn-outline-secondary" onclick="changeStatus('+index +', 1)">戻す</button></div></div></div>'
    }
  });
}

//注文ステータスの変更
function changeStatus(index, status) {
  var orderKeys = Object.keys(shopData.orders);
  var date = new Date();

  update(ref(db, "users/" + uid + "/orders/" + orderKeys[index]), {
    status : status,
    endTime : date.getTime()
  });
}

window.changeStatus = changeStatus;
export{changeStatus}

//注文の削除
function del(index) {
  var ask = confirm("削除してよろしいですか？");
  
  if(ask) {
    var orderKeys = Object.keys(shopData.orders);
    remove(ref(db, "users/" + uid + "/orders/" + orderKeys[index]));
  }
}

window.del = del;
export{del}


//QRコード生成
function makeQR(uid, num) {
  var qrtext = "https://goodorder-mtr.web.app/mobile.html?shop=" + uid + "&num=" + num;
  console.log(qrtext);
  var utf8qrtext = unescape(encodeURIComponent(qrtext));
  $("#img-qr").html("");
  $("#img-qr").qrcode({width:110,height:110,text:utf8qrtext}); 
  document.getElementById("qrspace").style.display = "";
}

//QR削除
function crossQR() {
  document.getElementById("qrspace").style.display = "none";
}

window.crossQR = crossQR;
export{crossQR}