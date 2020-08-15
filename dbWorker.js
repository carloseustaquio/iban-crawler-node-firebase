const { parentPort } = require("worker_threads");
const admin = require("firebase-admin");
const serviceAccount = require("./worker-tutorial-d0f36-firebase-adminsdk-3qq7b-3d20f057d8.json");

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
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
