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
const auth = getAuth();
var uid;
var menu = [];
let userData;
const customerTypes = ["理科大生", "高校生", "理科大教職員", "男性", "女性", "10代以下", "20～30代", "40～50代", "60代以上"];
var menuModal = new bootstrap.Modal(document.getElementById('exampleModal'));

//ログイン状態の取得
onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      uid = user.uid;
      document.getElementById("loginBtn").innerHTML = "<img src='"+user.photoURL+"' class='rounded-pill' width='40' onclick='logout()'>";
      
      get(ref(db, "users/" + uid)).then((snapshot) => {
        userData = snapshot.val();
        
        if(userData) {
            document.getElementById("sname").value = userData.info.shopName;
            document.getElementById("steam").value = userData.info.clubName;
            document.getElementById("menu").innerHTML = "";

            if(userData.info.receipt) {
                document.getElementById("receiptCheck").checked = true;
            }

            menu = userData.info.items;

            dispMenu();

            //注文履歴表示
            if(userData.orders) {
                var orders = userData.orders;
                document.getElementById("orderHistory").innerHTML = "";

                Object.keys(orders).forEach(key => {
                    var date = new Date(orders[key].time);
                    var dateText = (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
                    var status = "準備中";
                    var statusCol = "dark"
                    var number = ("000" + orders[key].number).slice(-3);

                    if(orders[key].status == 2) {status = "呼出中"; statusCol = "danger";}
                    if(orders[key].status == 3) {status = "提供済"; statusCol = "success"}

                    var orderText = "";
                    orders[key].items.forEach((itemNum, index) => {
                        if(itemNum > 0) {
                            orderText += userData.info.items[index].name + " " + itemNum + ", ";
                        }
                    });

                    orderText = orderText.slice( 0, -2 );

                    document.getElementById("orderHistory").innerHTML += '<tr><td>'+number+'</td><td>'+orderText+'</td><td>'+orders[key].price+'</td><td class="text-'+statusCol+'">'+status+'</td><td>'+dateText+'</td></tr>'
                });
            }
        }

        document.getElementById("loading").style.display = "none";
      });
    } else {
        alert("ログインが必要です。");
        login();
    }
});

//店舗設定
const uploadProfile = function() {
    console.log("Uploading...");
    
    get(ref(db, "users/" + uid)).then((snapshot) => {
        var shopData = {
            info : {
                shopName : document.getElementById("sname").value,
                clubName : document.getElementById("steam").value,
                receipt : document.getElementById("receiptCheck").checked,
                items : menu,
                nextNum : 1
            }
        }

        userData = snapshot.val();

        if(!userData) {
            set(ref(db, "users/" + uid), shopData)
            .then(() => {
                window.location.href = "../";
            });
        } else {
            if(userData.info.nextNum) {
                shopData.info.nextNum = userData.info.nextNum;
            }

            update(ref(db, "users/" + uid), shopData)
            .then(() => {
                window.location.href = "../";
            });
        }
    });
}

window.uploadProfile = uploadProfile;
export {uploadProfile}

//メニュー追加
const addMenu = function() {
    menu.push({
        name : document.getElementById("itemName").value,
        detail : document.getElementById("itemDetail").value,
        price : document.getElementById("itemPrice").value
    });

    dispMenu();

    menuModal.hide();

    document.getElementById("itemName").value = "";
    document.getElementById("itemDetail").value = "";
    document.getElementById("itemPrice").value = "";
}

window.addMenu = addMenu;
export{addMenu}

//メニュー削除
function delItem(index) {
    menu.splice(index, 1);
    dispMenu();
}

window.delItem = delItem;
export{delItem}


//メニュー表示
function dispMenu() {
    document.getElementById("menu").innerHTML = "";

    menu.forEach((item, index) => {
        document.getElementById("menu").innerHTML += '<li class="list-group-item"><div class="row"><div class="col-8">'+item.name+'</div><div class="col-3 text-secondary fw-bold">￥'+item.price+'</div><div class="col-1 text-secondary" onclick="delItem('+index+')" style="cursor: pointer;">✕</div></div></li>'
    });
}

//リセット
function reset() {
    var ask = confirm("全ての注文を削除してよろしいですか？");

    if(!ask) {return;}

    remove(ref(db, "users/"+uid + "/orders"))
    .then(() => {
        set(ref(db, "users/" + uid + "/info/nextNum"), 1)
        .then(() => {
            alert("全ての注文を削除しました。")
        });
    });
}

window.reset = reset;
export{reset}


//注文履歴をCSVで出力
function exportCSV() {
    var orders = userData.orders;
    let items = ["受付日時", "状態更新", "No.", "金額", "状態"];
    let tempData = [];
    items = items.concat(customerTypes);

    userData.info.items.forEach(item => {
        items.push(item.name);
    });

    console.log(items);

    //出力用データの作成
    tempData.push(items);

    Object.keys(orders).forEach((key, index) => {
        var order = orders[key];
        var startDate = (new Date(order.time)).toLocaleString();
        var endDate = (new Date(order.endTime)).toLocaleString();
        var status = "準備中";
        var data = [];

        if(status == 2) {status = "呼出済";}
        if(status == 3) {status = "提供済";}

        data = [startDate, endDate, order.number, order.price, status];

        data = data.concat(order.customerTypes);

        data = data.concat(order.items);

        tempData.push(data);
    });

    //CSVへの変換とダウンロード
    let csvContent = 'data:text/csv;charset=utf-8,' + tempData.map(e => e.join(',')).join('\n');
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'order_data.csv');
    document.body.appendChild(link);
    link.click();
}

window.exportCSV = exportCSV;
export{exportCSV}