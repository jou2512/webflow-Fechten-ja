console.log("new")
var home_url = "https://fen-cing.webflow.io/dashboard"
var login_path = "/login"
var firebaseConfig = {
apiKey: "AIzaSyBr2xKsQQzgSxalhoDc1m9xk78M75cNZrk",
authDomain: "fechtgesellschaft-1.firebaseapp.com",
databaseURL: "https://fechtgesellschaft-1-default-rtdb.firebaseio.com",
projectId: "fechtgesellschaft-1",
storageBucket: "fechtgesellschaft-1.appspot.com",
messagingSenderId: "1071586180289",
appId: "1:1071586180289:web:6dd7786f04880490bf6840",
measurementId: "G-47527PPD7X"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

const auth = firebase.auth()
console.log(auth)

let callback = null;
let metadataRef = null;

const authService = {
user: null,
authenticated () {
    return initializeAuth.then(user => {
    return user
    })
},
setUser (user) {
    this.user = user
},
registration (email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
},
login (email, password) {
    return auth.signInWithEmailAndPassword(email, password)
},
logout () {
    auth.signOut().then(() => {
    console.log('logout done')
    document.location.href = login_path;
    })
},
}

const initializeAuth = new Promise(resolve => {
// this adds a hook for the initial auth-change event
auth.onAuthStateChanged(user => {
    if (callback) {
        metadataRef.off('value', callback);
    }

    if (user) {
    console.log(user)
    // Check if refresh is required.
    metadataRef = firebase.database().ref('metadata/' + user.uid + '/refreshTime');
    console.log(metadataRef)
    callback = (snapshot) => {
        // Force refresh to pick up the latest custom claims changes.
        // Note this is always triggered on first call. Further optimization could be
        // added to avoid the initial trigger when the token is issued and already contains
        // the latest claims.
        user.getIdToken(true);
    };
    // Subscribe new listener to changes on that node.
    metadataRef.on('value', callback);

    user.getIdTokenResult().then(idtokenResult => {
        console.log(idtokenResult.claims)
        var curUrl = new URL(window.location.href);
        var finishRegisCheck = curUrl.pathname.indexOf('finishregister') === -1;
        console.log(idtokenResult.claims.finishregister !== undefined)
        console.log(!idtokenResult.claims.finishregister)
        console.log(finishRegisCheck)
        if((idtokenResult.claims.finishregister === undefined || !idtokenResult.claims.finishregister) && finishRegisCheck){
        document.location.href = "/finishregister";
        }
    })
    }
    authService.setUser(user)
    resolve(user)
})
})
var checking = false;
async function main() {
    checking = await authService.authenticated().then(() => { 
        var curUrl = new URL(window.location.href);
        var logincheck = curUrl.pathname.indexOf('login') === -1;
        var signupncheck = curUrl.pathname.indexOf('sign-up') === -1;
        var dashboardcheck = curUrl.pathname === '/';
        var finishRegisCheck = curUrl.pathname.indexOf('finishregister') === -1;
        console.log(logincheck,signupncheck,dashboardcheck,finishRegisCheck,curUrl.pathname)
        if(!authService.user && logincheck && signupncheck && finishRegisCheck){
            document.location.href = login_path;
        } else if(authService.user && (!(logincheck && signupncheck && !dashboardcheck) && finishRegisCheck)){
            document.location.href = home_url;
        }
        console.log(authService.user)
        return true;
    })
}
main()
console.log(checking)
window.authService = authService;