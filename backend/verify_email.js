require('dotenv').config();
const admin = require('firebase-admin');

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

async function main() {
  try {
    const userRecord = await admin.auth().getUserByEmail('ragav@lms.com');
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true
    });
    console.log("Successfully verified email for ragav@lms.com");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
