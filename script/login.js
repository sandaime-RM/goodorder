import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";


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
const provider = new GoogleAuthProvider();

const auth = getAuth(app);

//ログイン
function login() {
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
      console.log("ログイン完了");
      document.getElementById("loginBtn").innerHTML = "<img src='"+user.photoURL+"' class='rounded-pill' width='40' onclick='logout()'>";

      
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
}

window.login = login;
export{login}

//ログアウト
function logout() {
  var ask = confirm("ログアウトしますか？");
  if(!ask) {return;}
  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    console.log(error);
    alert(error);
  });
}

window.logout = logout;
export{logout}