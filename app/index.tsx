import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import LoadingHeart from '../components/LoadingHeart';
import {useEffect,useState} from "react"

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
   const [ready, setReady] = useState(false);
   
    

 useEffect(() => {
    
    const minimumDelay = new Promise(resolve => 
      setTimeout(resolve, 100)
    );
    
    const authReady = !loading ? Promise.resolve() : 
      new Promise(resolve => {
        const checkAuth = setInterval(() => {
          if (!loading) {
            clearInterval(checkAuth);
            resolve();
          }
        }, 500);
      });

    Promise.all([minimumDelay, authReady]).then(() => {
      setReady(true);
    });
  }, [loading]);
// 
  // if (!ready) {
  //   return <LoadingHeart />;
  // }

  if (isAuthenticated) {
    console.log(" Redirection vers (main)");
    return <Redirect href="/(main)" />;
  } else {
    console.log(" Redirection vers (auth)");
    return <Redirect href="/(auth)" />;
  }
}