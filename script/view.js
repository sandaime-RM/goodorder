// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
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
const auth = getAuth();
const db = getDatabase(app);

var uid, shopData;
var lastData = null;
const beep2 = new Audio("../sounds/receipt07.mp3");
const beep1 = new Audio("../sounds/hirameki2.mp3");

//ログイン状態の取得
onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;

        onValue(ref(db, "users/" + uid), (snapshot) => {
            shopData = snapshot.val();

            //注文追加の効果音
            if(lastData) {
                if(Object.keys(shopData.orders).length > Object.keys(lastData).length) {
                    beep1.play();
                }
            }
            
            document.getElementById("wait").innerHTML = "";
            document.getElementById("available").innerHTML = "";

            if(shopData.orders) {
                Object.keys(shopData.orders).forEach((key, index) => {
                    if(shopData.orders[key].status == 1) {
                        document.getElementById("wait").innerHTML += '<div class="col-lg-4 py-3 px-4"><div class="fs-1 text-center fw-bold text-secondary">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div></div>';
                    }

                    if(shopData.orders[key].status == 2) {
                        document.getElementById("available").innerHTML += '<div class="col-lg-4 py-3 px-4"><div class="fs-1 text-center fw-bold text-success">'+( '000' + shopData.orders[key].number ).slice( -3 )+'</div></div>';
                        
                        //完成したときの効果音
                        if(lastData) {
                            if(lastData[key]) {
                                if(lastData[key].status == 1) {
                                    beep2.play();
                                }
                            }
                        }
                    }
                });
            }

            lastData = shopData.orders;
        });
    } else {
        alert("ログインが必要です。");
    }
});