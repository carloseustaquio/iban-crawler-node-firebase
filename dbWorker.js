const { parentPort } = require("worker_threads");
const admin = require("firebase-admin");
const serviceAccount = require("./worker-tutorial-d0f36-firebase-adminsdk-3qq7b-3d20f057d8.json");

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyD3ktQv69abe0OIAFT9hipjO6-zkusgPj8",
  authDomain: "worker-tutorial-d0f36.firebaseapp.com",
  databaseURL: "https://worker-tutorial-d0f36.firebaseio.com",
  projectId: "worker-tutorial-d0f36",
  storageBucket: "worker-tutorial-d0f36.appspot.com",
  messagingSenderId: "41644565086",
  appId: "1:41644565086:web:4feba16810014e92fecacf",
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const date = new Date();
const currDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

parentPort.once("message", (message) => {
  console.log("Received data from mainWorker");

  db.collection("Rates")
    .doc(currDate)
    .set({
      rates: JSON.stringify(message),
    })
    .then(() => {
      parentPort.postMessage("Data saved successfully!");
    })
    .catch((err) => console.log(err));
});
