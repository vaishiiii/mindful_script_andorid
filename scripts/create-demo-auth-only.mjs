// One-off script: creates demo Firebase Auth accounts only (no Firestore writes).
// Usage: node scripts/create-demo-auth-only.mjs <email1> <password1> <name1> [<email2> <password2> <name2> ...]
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDJfSyMhl1xW4cncP2VfmOwz7mNqw5W8-I',
  authDomain: 'mindscript-1001.firebaseapp.com',
  projectId: 'mindscript-1001',
};

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 3 !== 0) {
  console.error('Usage: node scripts/create-demo-auth-only.mjs <email> <password> <name> ...');
  process.exit(1);
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  for (let i = 0; i < args.length; i += 3) {
    const [email, password, name] = [args[i], args[i + 1], args[i + 2]];
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      console.log(`${email} | created | uid: ${cred.user.uid}`);
      await signOut(auth);
    } catch (err) {
      console.log(`${email} | FAILED: ${err.code} ${err.message}`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
