// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
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

const uid = getParam("shop");
var num = getParam("num");

if(uid) {
    onValue(ref(db, "users/" + uid), (snapshot) => {
        var shopData = snapshot.val();

        //店名などを表示
        document.getElementById("shopName").textContent = shopData.info.shopName;
        document.getElementById("clubName").textContent = shopData.info.clubName;

        if(num) {
            document.getElementById("myNum").textContent = ( '000' + num ).slice( -3 );
        } else {
            num = -1;
        }

        //リセット
        document.getElementById("wait").innerHTML = "";
        document.getElementById("available").innerHTML = "";

        //受付番号の表示
        if(shopData.orders) {
            Object.keys(shopData.orders).forEach((key, index) => {
                var back = '';

                if(shopData.orders[key].status == 1) {
                    //自分のやつなら強調表示
                    if(Number(num) == Number(shopData.orders[key].number)) {
                        back = 'style="background:#ffeba3"';
                    }

                    document.getElementById("wait").innerHTML += '<div class="col-3 pb-2"><div '+back+' class="fs-1 rounded-3 text-center fw-bold text-secondary">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div></div>';
                }

                if(shopData.orders[key].status == 2) {
                    //自分のやつが完成していたら表示
                    if(Number(num) == Number(shopData.orders[key].number)) {
                        document.getElementById("alert").style.display = "";
                        back = 'style="background:#ffeba3"';
                    }

                    document.getElementById("available").innerHTML += '<div class="col-3 pb-2"><div '+back+' class="fs-1 rounded-3 text-center fw-bold text-success">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div></div>';
                }
            });
        }
    })
}

/**
 * Get the URL parameter value
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}