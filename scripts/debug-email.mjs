import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'AIzaSyDJfSyMhl1xW4cncP2VfmOwz7mNqw5W8-I',
  authDomain: 'mindscript-1001.firebaseapp.com',
  projectId: 'mindscript-1001',
});
const auth = getAuth(app);

const email = process.argv[2];
console.log('email value:', JSON.stringify(email), 'length', email.length);

try {
  const cred = await createUserWithEmailAndPassword(auth, email, 'TestPass123!');
  console.log('OK', cred.user.uid);
} catch (e) {
  console.log('ERR', e.code, e.message);
}
process.exit(0);
